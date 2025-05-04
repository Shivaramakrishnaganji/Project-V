import React, { useState, useEffect, useContext } from 'react';
import { Container, Button, Card, Form, Alert } from 'react-bootstrap';
import NavbarComponent from './Navbar';
import { DataContext } from '../context/DataContext';
import * as XLSX from 'xlsx';
import axios from 'axios';

const Summary = () => {
  const { students, attendance, feedback, setFeedback, subjectMapping, deleteAllStudents, syncDataAcrossComponents } = useContext(DataContext);
  const [userRole, setUserRole] = useState('faculty');
  const [course, setCourse] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [feedbackData, setFeedbackData] = useState({
    subjectName: '',
    topicName: '',
    contentDelivery: '',
    communication: '',
    bodyLanguage: '',
    notesFollowed: ''
  });
  const [error, setError] = useState('');
  const [simulateMode, setSimulateMode] = useState(true);
  const [smsStatus, setSmsStatus] = useState('');
  
  // Ensure we always have the required courses available
  const availableCourses = [...new Set([
    ...Object.keys(students),
    'Electrical Machine-II',
    'Digital Electronics',
    'Power System-II'
  ])];

  // Get summary picked data from localStorage
  const getSummaryData = () => {
    return JSON.parse(localStorage.getItem('summaryPickedData') || '[]');
  };

  // Get comprehensive cycle tracking data from localStorage
  const getSelectionCycleData = () => {
    return JSON.parse(localStorage.getItem('studentSelectionCycle') || '{}');
  };

  // Update summary data in localStorage
  const updateSummaryData = (student) => {
    const summary = getSummaryData();
    summary.push({ roll: student.roll, type: student.type, date: new Date().toISOString() });
    localStorage.setItem('summaryPickedData', JSON.stringify(summary));
    
    // Also update the comprehensive cycle tracking
    updateSelectionCycle(student);
    
    // Sync data across components
    syncDataAcrossComponents();
  };
  
  // Update the comprehensive selection cycle tracking
  const updateSelectionCycle = (student) => {
    const cycleData = getSelectionCycleData();
    
    // Initialize course data if it doesn't exist
    if (!cycleData[course]) {
      cycleData[course] = {
        slowLearners: { selected: [], remaining: [] },
        normalLearners: { selected: [], remaining: [] },
        currentCycle: 1,
        pattern: [],
        lastReset: new Date().toISOString()
      };
    }
    
    const courseData = cycleData[course];
    
    // If this is the first selection or after a reset, initialize the remaining students with present students only
    if (courseData.slowLearners.remaining.length === 0 && 
        courseData.normalLearners.remaining.length === 0) {
      
      // Get all present students from attendance records
      const presentStudents = getPresentStudents(course);
      console.log(`Initializing cycle with ${presentStudents.length} present students only`);
      
      // Separate present students by type
      const presentSlowLearners = presentStudents.filter(s => s.type === 'slow');
      const presentNormalLearners = presentStudents.filter(s => s.type === 'normal');
      
      // Set remaining lists to present students only
      courseData.slowLearners.remaining = presentSlowLearners.map(s => s.roll);
      courseData.normalLearners.remaining = presentNormalLearners.map(s => s.roll);
      
      console.log(`ML Algorithm: Initialized cycle ${courseData.currentCycle} with ${courseData.slowLearners.remaining.length} slow learners and ${courseData.normalLearners.remaining.length} normal learners (present today)`);
    }
    
    // Update the selected and remaining lists
    if (student.type === 'slow') {
      // Add to selected slow learners
      courseData.slowLearners.selected.push({
        roll: student.roll,
        date: new Date().toISOString()
      });
      
      // Remove from remaining slow learners
      const index = courseData.slowLearners.remaining.indexOf(student.roll);
      if (index !== -1) {
        courseData.slowLearners.remaining.splice(index, 1);
      }
    } else {
      // Add to selected normal learners
      courseData.normalLearners.selected.push({
        roll: student.roll,
        date: new Date().toISOString()
      });
      
      // Remove from remaining normal learners
      const index = courseData.normalLearners.remaining.indexOf(student.roll);
      if (index !== -1) {
        courseData.normalLearners.remaining.splice(index, 1);
      }
    }
    
    // Update the pattern
    courseData.pattern.push({
      roll: student.roll,
      type: student.type,
      date: new Date().toISOString(),
      cycle: courseData.currentCycle
    });
    
    // Check if the cycle is complete (all students selected)
    if (courseData.slowLearners.remaining.length === 0 && 
        courseData.normalLearners.remaining.length === 0) {
      
      // Start a new cycle
      courseData.currentCycle++;
      
      // Calculate completion percentage for logging
      const totalSelected = courseData.slowLearners.selected.length + courseData.normalLearners.selected.length;
      const presentStudents = getPresentStudents(course);
      const presentStudentCount = presentStudents.length;
      
      console.log(`ML Algorithm: Completed cycle ${courseData.currentCycle - 1} with ${totalSelected}/${presentStudentCount} present students`);
      
      // Reset for the next cycle - use only present students
      // Get fresh present student lists
      const freshPresentStudents = getPresentStudents(course);
      const presentSlowLearners = freshPresentStudents.filter(s => s.type === 'slow').map(s => s.roll);
      const presentNormalLearners = freshPresentStudents.filter(s => s.type === 'normal').map(s => s.roll);
      
      // Reset with fresh present students
      courseData.slowLearners.selected = [];
      courseData.slowLearners.remaining = [...presentSlowLearners];
      
      courseData.normalLearners.selected = [];
      courseData.normalLearners.remaining = [...presentNormalLearners];
      
      courseData.lastReset = new Date().toISOString();
      
      console.log(`ML Algorithm: Starting cycle ${courseData.currentCycle} with ${presentSlowLearners.length} slow and ${presentNormalLearners.length} normal learners (present today)`);
    }
    
    // Save updated cycle data
    cycleData[course] = courseData;
    localStorage.setItem('studentSelectionCycle', JSON.stringify(cycleData));
  };

  useEffect(() => {
    // Get user info from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(user.role || 'faculty');
  }, []);

  // Get present students from attendance records for the selected course
  const getPresentStudents = (selectedCourse) => {
    if (!attendance || !Array.isArray(attendance)) {
      console.log("No attendance records found");
      return [];
    }

    // Get the MOST RECENT attendance record for the selected course
    const courseAttendance = attendance
      .filter(record => record.course === selectedCourse)
      .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date descending
    
    if (courseAttendance.length === 0) {
      console.log(`No attendance records found for course: ${selectedCourse}`);
      return [];
    }

    // Use the most recent attendance record
    const latestAttendance = courseAttendance[0];
    console.log(`Using most recent attendance from: ${latestAttendance.date}, Hour: ${latestAttendance.hour}`);
    
    // Extract only students marked as PRESENT in the latest attendance
    const presentStudents = latestAttendance.records
      .filter(student => student.status === 'present');
    
    console.log(`Found ${presentStudents.length} students marked as PRESENT in the latest attendance record`);
    
    // Map attendance records to full student details from database
    const studentsWithDetails = [];
    const seenRolls = new Set();
    
    presentStudents.forEach(student => {
      if (!seenRolls.has(student.roll)) {
        seenRolls.add(student.roll);
        
        // Find the complete student details from the database
        const studentInDatabase = students[selectedCourse]?.find(s => s.roll === student.roll);
        if (studentInDatabase) {
          // Use the student details from the database to ensure correct type
          studentsWithDetails.push({
            ...student,
            name: studentInDatabase.name,
            type: studentInDatabase.type,
            parentName: studentInDatabase.parentName,
            parentPhone: studentInDatabase.parentPhone
          });
        }
      }
    });

    // Debug logging
    console.log(`Final present students for ${selectedCourse}:`, 
      studentsWithDetails.map(s => `${s.name} (${s.roll}) - ${s.type} - ${s.status}`));
    
    return studentsWithDetails;
  };

  const selectStudent = () => {
    if (!course) {
      setError('Please select a course');
      return;
    }

    // Clear any previous errors
    setError('');
    
    // Ensure we have the latest data before selection
    syncDataAcrossComponents();

    // Get only PRESENT students from the selected course's most recent attendance record
    const presentStudents = getPresentStudents(course);
    
    // STRICT CHECK: If there are NO present students at all, show an error and exit
    if (!presentStudents || presentStudents.length === 0) {
      setError('No students are marked present in the attendance records. Cannot select a student.');
      console.error(`ERROR: No present students found for course ${course}. All students are marked absent.`);
      return;
    }
    
    // Count present students by type
    const presentSlowLearners = presentStudents.filter(s => s.type === 'slow');
    const presentNormalLearners = presentStudents.filter(s => s.type === 'normal');
    
    console.log(`Available for selection: ${presentSlowLearners.length} slow learners and ${presentNormalLearners.length} normal learners (present today)`);
    
    // Check which learner types are available, but continue even if one type is missing
    if (presentSlowLearners.length === 0) {
      console.warn('WARNING: No slow learners are present in attendance records. Will select only from normal learners.');
    }
    
    if (presentNormalLearners.length === 0) {
      console.warn('WARNING: No normal learners are present in attendance records. Will select only from slow learners.');
    }
    
    // Only fail if BOTH types are missing
    if (presentSlowLearners.length === 0 && presentNormalLearners.length === 0) {
      setError('No students of any type are marked present today. Cannot select a student.');
      console.error('ERROR: No students of any type are present in attendance records');
      return;
    }

    // Get the selection cycle data - but only initialize with present students
    const cycleData = getSelectionCycleData();
    const courseData = cycleData[course] || {
      slowLearners: { selected: [], remaining: [] },
      normalLearners: { selected: [], remaining: [] },
      currentCycle: 1,
      pattern: [],
      lastReset: new Date().toISOString()
    };
    
    // Initialize or reset if needed, using ONLY present students
    if ((courseData.slowLearners.remaining.length === 0 && 
         courseData.normalLearners.remaining.length === 0) ||
        (courseData.slowLearners.selected.length === 0 && 
         courseData.normalLearners.selected.length === 0)) {
      
      // Reset/initialize with ONLY present students
      courseData.slowLearners = { 
        selected: [], 
        remaining: presentSlowLearners.map(s => s.roll) 
      };
      
      courseData.normalLearners = { 
        selected: [], 
        remaining: presentNormalLearners.map(s => s.roll) 
      };
      
      cycleData[course] = courseData;
      localStorage.setItem('studentSelectionCycle', JSON.stringify(cycleData));
      
      console.log(`ML Algorithm: Initialized selection cycle with ${courseData.slowLearners.remaining.length} slow and ${courseData.normalLearners.remaining.length} normal learners (present today)`);
    } else {
      // Filter remaining lists to only include present students
      courseData.slowLearners.remaining = courseData.slowLearners.remaining
        .filter(roll => presentStudents.some(s => s.roll === roll && s.type === 'slow'));
      
      courseData.normalLearners.remaining = courseData.normalLearners.remaining
        .filter(roll => presentStudents.some(s => s.roll === roll && s.type === 'normal'));
      
      // Update storage with filtered lists
      cycleData[course] = courseData;
      localStorage.setItem('studentSelectionCycle', JSON.stringify(cycleData));
      
      console.log(`ML Algorithm: Filtered remaining lists to ${courseData.slowLearners.remaining.length} slow and ${courseData.normalLearners.remaining.length} normal learners (present today)`);
    }
    
    // Determine the required type based on available students and 2:1 ratio
    // Pattern: Count from pattern array to maintain ratio across sessions
    const slowCount = courseData.pattern.filter(p => p.type === 'slow' && p.cycle === courseData.currentCycle).length;
    const normalCount = courseData.pattern.filter(p => p.type === 'normal' && p.cycle === courseData.currentCycle).length;
    
    let requiredType;
    // If one type is entirely missing, we have no choice but to use the other type
    if (presentSlowLearners.length === 0) {
      requiredType = 'normal';
      console.log('ML Algorithm: Forcing normal learner selection (no slow learners present)');
    } else if (presentNormalLearners.length === 0) {
      requiredType = 'slow';
      console.log('ML Algorithm: Forcing slow learner selection (no normal learners present)');
    } else {
      // STRICT RATIO ENFORCEMENT: Maintain exactly 2:1 ratio when both types are available
      // Calculate the ideal ratio based on previous selections
      const idealSlowCount = normalCount * 2;
      
      if (slowCount < idealSlowCount) {
        // Need more slow learners to maintain 2:1 ratio
        requiredType = 'slow';
        console.log(`ML Algorithm: Selecting slow learner to maintain 2:1 ratio (current ratio: ${slowCount}:${normalCount})`);
      } else {
        // Need a normal learner now
        requiredType = 'normal';
        console.log(`ML Algorithm: Selecting normal learner to maintain 2:1 ratio (current ratio: ${slowCount}:${normalCount})`);
      }
    }
    
    console.log(`ML Algorithm: Cycle ${courseData.currentCycle}, Ratio status - Slow: ${slowCount}, Normal: ${normalCount}, Required: ${requiredType}`);
    
    // Get candidates of the required type from remaining students who are PRESENT today
    let candidates;
    if (requiredType === 'slow') {
      candidates = courseData.slowLearners.remaining;
    } else {
      candidates = courseData.normalLearners.remaining;
    }
    
    // If no candidates of required type, try the other type if maintaining the ratio isn't critical
    if (candidates.length === 0) {
      console.log(`ML Algorithm: No ${requiredType} learners available who are present and not picked yet`);
      
      // Get candidates of the opposite type who are PRESENT
      const oppositeType = requiredType === 'slow' ? 'normal' : 'slow';
      const oppositeCandidates = oppositeType === 'slow' 
        ? courseData.slowLearners.remaining
        : courseData.normalLearners.remaining;
      
      if (oppositeCandidates.length > 0) {
        console.log(`ML Algorithm: Switching to ${oppositeType} learners (${oppositeCandidates.length} available)`);
        requiredType = oppositeType;
        candidates = oppositeCandidates;
      } else {
        console.log('ML Algorithm: No candidates of either type available who are present and not picked yet');
        
        // Check if we need to reset the cycle
        if (courseData.slowLearners.remaining.length === 0 && 
            courseData.normalLearners.remaining.length === 0) {
          
          console.log('ML Algorithm: End of cycle detected - automatically starting new cycle with present students');
          
          // Reset the selection cycle with ONLY present students
          courseData.currentCycle++;
          
          // Reinitialize with only present students
          courseData.slowLearners = { 
            selected: [], 
            remaining: presentSlowLearners.map(s => s.roll) 
          };
          
          courseData.normalLearners = { 
            selected: [], 
            remaining: presentNormalLearners.map(s => s.roll) 
          };
          
          // Update the cycle data
          cycleData[course] = courseData;
          localStorage.setItem('studentSelectionCycle', JSON.stringify(cycleData));
          
          console.log(`ML Algorithm: Reset cycle with ${courseData.slowLearners.remaining.length} slow and ${courseData.normalLearners.remaining.length} normal learners (present today)`);
          
          // Now try to select again after reset
          if (requiredType === 'slow') {
            candidates = courseData.slowLearners.remaining;
          } else {
            candidates = courseData.normalLearners.remaining;
          }
          
          if (candidates.length === 0) {
            // If still no candidates of required type, try opposite type
            requiredType = requiredType === 'slow' ? 'normal' : 'slow';
            candidates = requiredType === 'slow' 
              ? courseData.slowLearners.remaining 
              : courseData.normalLearners.remaining;
            
            if (candidates.length === 0) {
              setError('No eligible students found for feedback. Please ensure students of both types are present in attendance records.');
              return;
            }
          }
        } else {
          setError('No eligible students found for feedback. Please ensure students are marked present in attendance records.');
          return;
        }
      }
    }
    
    // Apply ML weights to candidates (all are confirmed present at this point)
    const weightedCandidates = [];
    
    // Load model training data from previous feedback and selections
    const feedbackHistory = JSON.parse(localStorage.getItem('feedback') || '[]');
    const previousSelections = getSummaryData();
    
    console.log(`ML Algorithm: Training on ${feedbackHistory.length} feedback records and ${previousSelections.length} previous selections`);
    
    for (const rollNumber of candidates) {
      const student = presentStudents.find(s => s.roll === rollNumber);
      
      // Skip if student is not present (should never happen with our filtering)
      if (!student) {
        console.error(`ML Algorithm Error: Student ${rollNumber} not found in present students list`);
        continue;
      }
      
      // === ML MODEL: Calculate weights based on multiple factors ===
      let weight = 1.0; // Base weight
      
      // FACTOR 1: Attendance record (higher attendance = higher priority)
      const attendanceCount = attendance
        .filter(record => record.course === course)
        .flatMap(record => record.records)
        .filter(record => record.roll === rollNumber && record.status === 'present')
        .length;
      
      const attendanceWeight = attendanceCount * 0.1;
      weight += attendanceWeight;
      
      // FACTOR 2: Previous feedback history
      const studentFeedback = feedbackHistory.filter(f => f.roll === rollNumber);
      
      if (studentFeedback.length === 0) {
        // No previous feedback, high priority (exploration factor)
        const noFeedbackWeight = 3.0;
        weight += noFeedbackWeight;
        console.log(`ML Algorithm: ${student.name} has no feedback history, adding exploration weight +${noFeedbackWeight}`);
      } else {
        // FACTOR 2a: Recency - when was the student last picked?
        const lastFeedback = new Date(Math.max(...studentFeedback.map(f => new Date(f.date).getTime())));
        const daysSinceLastFeedback = Math.floor((new Date() - lastFeedback) / (1000 * 60 * 60 * 24));
        const recencyWeight = Math.min(daysSinceLastFeedback * 0.2, 2.0); // Cap at 2.0
        weight += recencyWeight;
        
        if (recencyWeight > 1.0) {
          console.log(`ML Algorithm: ${student.name} hasn't been picked for ${daysSinceLastFeedback} days, adding recency weight +${recencyWeight.toFixed(2)}`);
        }
        
        // FACTOR 2b: Performance - prioritize students who need improvement
        const avgScore = studentFeedback.reduce((sum, f) => 
          sum + ((parseInt(f.contentDelivery) + parseInt(f.communication) + parseInt(f.bodyLanguage)) / 3), 0) / studentFeedback.length;
        
        let performanceWeight = 0;
        
        if (avgScore < 2) {
          // Very low performer, needs urgent attention
          performanceWeight = 3.0;
          console.log(`ML Algorithm: ${student.name} has very poor performance (avg: ${avgScore.toFixed(2)}), adding high priority weight +${performanceWeight}`);
        } else if (avgScore < 3) {
          // Below average performer
          performanceWeight = 2.0;
          console.log(`ML Algorithm: ${student.name} has below average performance (avg: ${avgScore.toFixed(2)}), adding priority weight +${performanceWeight}`);
        } else if (avgScore < 4) {
          // Average performer
          performanceWeight = 1.0;
        }
        
        weight += performanceWeight;
        
        // FACTOR 2c: Trend analysis - is the student improving or declining?
        if (studentFeedback.length >= 2) {
          // Sort by date ascending
          const sortedFeedback = [...studentFeedback].sort((a, b) => new Date(a.date) - new Date(b.date));
          const recentFeedbacks = sortedFeedback.slice(-3); // Last 3 feedbacks
          
          // Calculate trend
          let trend = 0;
          for (let i = 1; i < recentFeedbacks.length; i++) {
            const prevScore = (parseInt(recentFeedbacks[i-1].contentDelivery) + parseInt(recentFeedbacks[i-1].communication) + parseInt(recentFeedbacks[i-1].bodyLanguage)) / 3;
            const currentScore = (parseInt(recentFeedbacks[i].contentDelivery) + parseInt(recentFeedbacks[i].communication) + parseInt(recentFeedbacks[i].bodyLanguage)) / 3;
            trend += (currentScore - prevScore);
          }
          
          trend = trend / (recentFeedbacks.length - 1); // Average trend
          
          // Add trend weight
          const trendWeight = trend < 0 ? Math.min(Math.abs(trend) * 2, 2.0) : 0; // Only consider negative trends
          weight += trendWeight;
          
          if (trendWeight > 0) {
            console.log(`ML Algorithm: ${student.name} is showing a declining trend (${trend.toFixed(2)}), adding trend weight +${trendWeight.toFixed(2)}`);
          }
        }
      }
      
      // FACTOR 3: Selection frequency in current cycle
      const selectionCount = courseData.pattern.filter(p => 
        p.roll === rollNumber && p.cycle === courseData.currentCycle
      ).length;
      
      // Reduce weight if student has been selected multiple times in this cycle already
      if (selectionCount > 0) {
        const frequencyPenalty = Math.min(selectionCount * 0.5, 1.5);
        weight -= frequencyPenalty;
        console.log(`ML Algorithm: ${student.name} has been selected ${selectionCount} times in this cycle, applying frequency penalty -${frequencyPenalty}`);
      }
      
      // Final weighted candidate
      weightedCandidates.push({
        roll: rollNumber,
        student,
        weight: Math.max(0.1, weight) // Ensure minimum weight of 0.1
      });
    }
    
    // Sort by weight for logging
    weightedCandidates.sort((a, b) => b.weight - a.weight);
    
    // Log top candidates
    console.log(`ML Algorithm - Top ${requiredType} learner candidates who are present today:`);
    weightedCandidates.slice(0, 3).forEach((candidate, i) => {
      console.log(`${i+1}. ${candidate.student.name} (${candidate.roll}): weight=${candidate.weight.toFixed(2)}`);
    });
    
    // Select based on weighted probability
    let selectedRoll = null;
    
    if (weightedCandidates.length > 0) {
      // Calculate total weight
      const totalWeight = weightedCandidates.reduce((sum, candidate) => sum + candidate.weight, 0);
      
      // Select using weighted probability
      let randomValue = Math.random() * totalWeight;
      let cumulativeWeight = 0;
      
      for (const candidate of weightedCandidates) {
        cumulativeWeight += candidate.weight;
        if (randomValue <= cumulativeWeight) {
          selectedRoll = candidate.roll;
          break;
        }
      }
      
      // Fallback in case of rounding errors
      if (!selectedRoll) {
        selectedRoll = weightedCandidates[0].roll;
      }
    } else {
      setError('No eligible students found who are present today.');
      return;
    }
    
    // Get full student details from the database
    const selectedDetails = presentStudents.find(s => s.roll === selectedRoll);
    
    if (!selectedDetails) {
      setError(`Student with roll ${selectedRoll} is not present today.`);
      return;
    }
    
    // Success - set selected student
    setSelectedStudent(selectedDetails);
    
    // Update tracking data
    updateSummaryData(selectedDetails);
    
    console.log(`ML Algorithm selected: ${selectedDetails.name} (${selectedDetails.roll}) - ${selectedDetails.type} learner from attendance record`);
    
    // Set subject name
    setFeedbackData(prev => ({
      ...prev,
      subjectName: subjectMapping[course] || course
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFeedbackData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const submitFeedback = async () => {
    if (!selectedStudent) {
      setError('No student selected');
      return;
    }

    // Clear any previous errors
    setError('');

    const { subjectName, topicName, contentDelivery, communication, bodyLanguage, notesFollowed } = feedbackData;
    
    // Validate inputs
    if (!topicName || !contentDelivery || !communication || !bodyLanguage || !notesFollowed) {
      setError('Please fill all feedback fields');
      return;
    }

    // Calculate feedback percentage
    const feedbackPercentage = ((parseInt(contentDelivery) + parseInt(communication) + parseInt(bodyLanguage)) / 15) * 100;
    
    // Create feedback object
    const newFeedback = {
      roll: selectedStudent.roll,
      name: selectedStudent.name,
      type: selectedStudent.type,
      subjectName,
      topicName,
      contentDelivery: parseInt(contentDelivery),
      communication: parseInt(communication),
      bodyLanguage: parseInt(bodyLanguage),
      notesFollowed,
      feedbackPercentage: feedbackPercentage.toFixed(2),
      date: new Date().toISOString(),
    };

    // Add to feedback context and localStorage
    const updatedFeedback = [...(Array.isArray(feedback) ? feedback : []), newFeedback];
    setFeedback(updatedFeedback);
    localStorage.setItem('feedback', JSON.stringify(updatedFeedback));
    
    // Ensure data is synced across components
    syncDataAcrossComponents();

    // Check for low content delivery
    const lowContentDeliveryCount = updatedFeedback
      .filter(f => f.roll === selectedStudent.roll && f.contentDelivery < 3)
      .length;

    if (lowContentDeliveryCount > 3) {
      alert(`HOD and Counselor Meeting Required for Improvement ${selectedStudent.name} (${selectedStudent.roll})`);
    }

    // Create SMS message
    const smsMessage = `Dear Parent, \nYour ward ${selectedStudent.name} (${selectedStudent.roll}) has received the following feedback:\n\n` +
      `Subject: ${subjectName}\n` +
      `Topic: ${topicName}\n` +
      `Content Delivery: ${contentDelivery}/5\n` +
      `Communication: ${communication}/5\n` +
      `Body Language: ${bodyLanguage}/5\n` +
      `Notes Followed: ${notesFollowed}\n` +
      `Overall Feedback Percentage: ${feedbackPercentage.toFixed(2)}%\n\n` +
      `Thank you for your cooperation.`;

    // Send SMS notification
    try {
      console.log(`Sending notification to parent (${selectedStudent.parentPhone})`);
      if (!simulateMode) {
        try {
          // First check if backend is available
          await axios.get('http://localhost:5001/api/test')
            .catch(err => {
              console.warn('Backend not available, falling back to simulation mode');
              throw new Error('Backend not available');
            });
                
          // Actually send SMS using backend
          const response = await axios.post('http://localhost:5001/api/send-sms', {
            to: selectedStudent.parentPhone,
            message: smsMessage,
            simulate: false
          });
          
          console.log('SMS notification response:', response.data);
          
          if (response.data.success) {
            setSmsStatus(`SMS notification ${response.data.simulated ? 'simulated' : 'sent'} successfully`);
          } else {
            setSmsStatus(`SMS notification failed: ${response.data.error}`);
          }
        } catch (err) {
          console.warn('SMS sending failed, using simulation mode instead:', err.message);
          setSmsStatus('SMS notification simulated (backend unavailable)');
        }
      } else {
        // Simulate SMS sending (no backend call)
        console.log('Simulating SMS notification...');
        console.log('SMS Content:', smsMessage);
        setSmsStatus('SMS notification simulated (simulation mode enabled)');
      }
    } catch (error) {
      console.error('SMS notification error:', error);
      setSmsStatus(`SMS notification error: ${error.message || 'Unknown error'}`);
    }

    // Reset form
    setSelectedStudent(null);
    setCourse('');
    setFeedbackData({
      subjectName: '',
      topicName: '',
      contentDelivery: '',
      communication: '',
      bodyLanguage: '',
      notesFollowed: ''
    });
  };

  const generateReport = () => {
    // Get feedback data from localStorage
    const feedbacks = JSON.parse(localStorage.getItem('feedback') || '[]');
    
    if (!feedbacks.length) {
      alert('No feedback data available to generate a report.');
      return;
    }

    // Create data for Excel
    const data = [
      ['Roll Number', 'Name', 'Type', 'Subject Name', 'Topic Name', 'Content Delivery', 'Communication', 'Body Language', 'Notes Followed', 'Feedback %', 'Date'],
      ...feedbacks.map(f => [
        f.roll,
        f.name,
        f.type,
        f.subjectName,
        f.topicName,
        f.contentDelivery,
        f.communication,
        f.bodyLanguage,
        f.notesFollowed,
        f.feedbackPercentage,
        f.date
      ])
    ];

    // Generate Excel file
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Feedback Report');
    XLSX.writeFile(wb, 'feedback_report.xlsx');

    // Clear feedback data
    localStorage.removeItem('feedback');
    setFeedback([]);
    alert('Excel report generated successfully. Summary data cleared.');
  };

  // Add function to handle deletion of all student records
  const handleDeleteStudents = () => {
    if (!course) {
      setError('Please select a course first.');
      return;
    }

    if (window.confirm(`Are you sure you want to remove all students from ${course}? This cannot be undone.`)) {
      deleteAllStudents(course);
      // Also reset the selection cycle data for this course
      const cycleData = getSelectionCycleData();
      if (cycleData[course]) {
        delete cycleData[course];
        localStorage.setItem('studentSelectionCycle', JSON.stringify(cycleData));
      }
      alert(`All students from ${course} have been removed.`);
    }
  };

  return (
    <>
      <NavbarComponent userRole={userRole} />
      <Container className="mt-4">
        <div className="feedback-container mx-auto" style={{ maxWidth: '600px', margin: '2rem auto' }}>
          <h2 className="mb-4">Select Course for Summary</h2>
          <Form.Select 
            className="mb-3" 
            value={course} 
            onChange={(e) => setCourse(e.target.value)}
          >
            <option value="">Select Course</option>
            {availableCourses.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Form.Select>
          
          <div className="form-check mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="simulateMode"
              checked={simulateMode}
              onChange={(e) => setSimulateMode(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="simulateMode">
              Simulation Mode (No actual SMS sent)
            </label>
          </div>
          
          <Button variant="primary" className="w-100 mb-4" onClick={selectStudent} disabled={!course}>
            Pick Student
          </Button>
          
          {course && (
            <div className="d-flex justify-content-between mb-4">
              <Button 
                variant="outline-danger" 
                onClick={handleDeleteStudents} 
                disabled={!students[course] || students[course].length === 0}
              >
                Remove All Students from {course}
              </Button>
            </div>
          )}
          
          {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
          
          {selectedStudent && (
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>Selected Student</Card.Title>
                <Card.Text>
                  {selectedStudent.name} ({selectedStudent.roll}) - {selectedStudent.type} learner
                </Card.Text>
              </Card.Body>
            </Card>
          )}
          
          {selectedStudent && (
            <div>
              <h4 className="mb-3">Feedback</h4>
              <div className="mb-3">
                <Form.Label>Subject Name</Form.Label>
                <Form.Control 
                  type="text" 
                  name="subjectName" 
                  value={feedbackData.subjectName || ''} 
                  readOnly 
                />
              </div>
              <div className="mb-3">
                <Form.Label>Topic Name</Form.Label>
                <Form.Control 
                  type="text" 
                  name="topicName" 
                  value={feedbackData.topicName || ''} 
                  onChange={handleInputChange} 
                  placeholder="Enter Topic Name" 
                />
              </div>
              
              <div className="mb-3">
                <Form.Label>Content Delivery (1-5)</Form.Label>
                <div className="d-flex gap-3">
                  {[1, 2, 3, 4, 5].map(value => (
                    <Form.Check
                      key={value}
                      type="radio"
                      name="contentDelivery"
                      value={value}
                      label={value}
                      onChange={handleInputChange}
                      checked={feedbackData.contentDelivery === value.toString()}
                      inline
                    />
                  ))}
                </div>
              </div>
              
              <div className="mb-3">
                <Form.Label>Communication (1-5)</Form.Label>
                <div className="d-flex gap-3">
                  {[1, 2, 3, 4, 5].map(value => (
                    <Form.Check
                      key={value}
                      type="radio"
                      name="communication"
                      value={value}
                      label={value}
                      onChange={handleInputChange}
                      checked={feedbackData.communication === value.toString()}
                      inline
                    />
                  ))}
                </div>
              </div>
              
              <div className="mb-3">
                <Form.Label>Body Language (1-5)</Form.Label>
                <div className="d-flex gap-3">
                  {[1, 2, 3, 4, 5].map(value => (
                    <Form.Check
                      key={value}
                      type="radio"
                      name="bodyLanguage"
                      value={value}
                      label={value}
                      onChange={handleInputChange}
                      checked={feedbackData.bodyLanguage === value.toString()}
                      inline
                    />
                  ))}
                </div>
              </div>
              
              <div className="mb-3">
                <Form.Label>Class Notes Followed</Form.Label>
                <div className="d-flex gap-3">
                  <Form.Check
                    type="radio"
                    name="notesFollowed"
                    value="Yes"
                    label="Yes"
                    onChange={handleInputChange}
                    checked={feedbackData.notesFollowed === "Yes"}
                    inline
                  />
                  <Form.Check
                    type="radio"
                    name="notesFollowed"
                    value="No"
                    label="No"
                    onChange={handleInputChange}
                    checked={feedbackData.notesFollowed === "No"}
                    inline
                  />
                </div>
              </div>
              
              <Button variant="success" className="w-100" onClick={submitFeedback}>
                Submit Feedback
              </Button>
            </div>
          )}
        </div>
        
        <div className="position-fixed bottom-0 end-0 p-3">
          <Button variant="info" onClick={generateReport}>
            Generate Excel Report
          </Button>
        </div>
      </Container>
      {smsStatus && <Alert variant="info" className="mt-3">{smsStatus}</Alert>}
    </>
  );
};

export default Summary;