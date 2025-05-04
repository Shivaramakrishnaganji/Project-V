import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Create context
export const DataContext = createContext();

const defaultStudents = {
  'Electrical Machine-II': [
    { roll: '23891A0201', name: 'Shiva', type: 'slow', parentName: 'Parent 1', parentPhone: '9390326221' },
    { roll: '23891A0202', name: 'Ram', type: 'normal', parentName: 'Parent 2', parentPhone: '9390326221' },
    { roll: '23891A0203', name: 'Krishna', type: 'slow', parentName: 'Parent 3', parentPhone: '9390326221' },
  ],
  'Digital Electronics': [
    { roll: '23891A0201', name: 'Shiva', type: 'slow', parentName: 'Parent 1', parentPhone: '9390326221' },
    { roll: '23891A0202', name: 'Ram', type: 'normal', parentName: 'Parent 2', parentPhone: '9390326221' },
    { roll: '23891A0203', name: 'Krishna', type: 'slow', parentName: 'Parent 3', parentPhone: '9390326221' },
  ],
  'Power System-II': [
    { roll: '23891A0201', name: 'Shiva', type: 'slow', parentName: 'Parent 1', parentPhone: '9390326221' },
    { roll: '23891A0202', name: 'Ram', type: 'normal', parentName: 'Parent 2', parentPhone: '9390326221' },
    { roll: '23891A0203', name: 'Krishna', type: 'slow', parentName: 'Parent 3', parentPhone: '9390326221' },
  ],
};


// Create provider component
const DataProvider = ({ children }) => {
  const [students, setStudents] = useState(() => {
    return JSON.parse(localStorage.getItem('students')) || defaultStudents;
  });
  const [attendance, setAttendance] = useState(() => {
    return JSON.parse(localStorage.getItem('attendance')) || [];
  });
  const [feedback, setFeedback] = useState(() => {
    return JSON.parse(localStorage.getItem('feedback')) || [];
  });
  const [smsHistory, setSmsHistory] = useState(() => {
    return JSON.parse(localStorage.getItem('smsHistory')) || [];
  });
  
  // Flag to track if data needs to be synchronized with the server
  const [needsSync, setNeedsSync] = useState(false);
  
  // Subject mapping for consistent naming
  const subjectMapping = {
    'Electrical Machine-II': 'Electrical Machine-II',
    'Digital Electronics': 'Digital Electronics',
    'Power System-II': 'Power System-II',
  };

  useEffect(() => {
    localStorage.setItem('students', JSON.stringify(students));
    setNeedsSync(true);
  }, [students]);
  
  useEffect(() => {
    localStorage.setItem('attendance', JSON.stringify(attendance));
    setNeedsSync(true);
  }, [attendance]);
  
  useEffect(() => {
    localStorage.setItem('feedback', JSON.stringify(feedback));
    setNeedsSync(true);
  }, [feedback]);
  
  useEffect(() => {
    localStorage.setItem('smsHistory', JSON.stringify(smsHistory));
    setNeedsSync(true);
  }, [smsHistory]);

  // Sync function to ensure all components have latest data
  const syncDataAcrossComponents = () => {
    // Update localStorage again to ensure all components have the latest data
    localStorage.setItem('students', JSON.stringify(students));
    localStorage.setItem('attendance', JSON.stringify(attendance));
    localStorage.setItem('feedback', JSON.stringify(feedback));
    localStorage.setItem('smsHistory', JSON.stringify(smsHistory));
    
    // Try to sync with backend if available
    syncWithBackend().catch(err => {
      console.log('Backend sync failed, continuing with local data:', err.message);
    });
    
    setNeedsSync(false);
    return true;
  };
  
  // Optional: sync with backend if needed
  const syncWithBackend = async () => {
    try {
      // Check if backend is available
      const testResponse = await axios.get('http://localhost:5001/api/test');
      
      if (testResponse.data && testResponse.data.message === 'API is working!') {
        console.log('Backend connection established, synchronizing data...');
        
        // Send all data to backend for synchronization
        const syncResponse = await axios.post('http://localhost:5001/api/sync', {
          students,
          attendance,
          feedback,
          smsHistory
        });
        
        if (syncResponse.data && syncResponse.data.success) {
          console.log(`Data successfully synchronized with backend at ${syncResponse.data.timestamp}`);
          return true;
        } else {
          console.error('Backend sync failed:', syncResponse.data.error);
          return false;
        }
      }
    } catch (error) {
      console.log('Backend not available, operating in offline mode:', error.message);
      return false;
    }
  };

  const addStudent = (course, student) => {
    setStudents((prev) => {
      const newStudents = { ...prev };
      if (!newStudents[course]) newStudents[course] = [];
      
      // Check if student with same roll number already exists in this course
      const studentExists = newStudents[course].some(s => s.roll === student.roll);
      
      if (studentExists) {
        // Don't add duplicate, just return the current state
        console.log('Student with roll number', student.roll, 'already exists in', course);
        return prev; 
      }
      
      // Only add if student doesn't already exist
      newStudents[course].push(student);
      return newStudents;
    });
  };

  const updateStudent = (course, rollNumber, updatedData) => {
    setStudents(prev => {
      const newStudents = { ...prev };
      if (newStudents[course]) {
        newStudents[course] = newStudents[course].map(student => 
          student.roll === rollNumber ? { ...student, ...updatedData } : student
        );
      }
      return newStudents;
    });
  };

  const deleteStudent = (course, rollNumber) => {
    setStudents(prev => {
      const newStudents = { ...prev };
      if (newStudents[course]) {
        newStudents[course] = newStudents[course].filter(student => student.roll !== rollNumber);
      }
      return newStudents;
    });
  };

  // Delete all students from a specific course or all courses
  const deleteAllStudents = (course = null) => {
    setStudents(prev => {
      // If course is provided, clear only that course
      if (course) {
        const newStudents = { ...prev };
        newStudents[course] = [];
        return newStudents;
      } 
      // If no course is provided, clear all students from all courses
      else {
        const newStudents = { ...prev };
        // Keep the course keys but empty the arrays
        Object.keys(newStudents).forEach(key => {
          newStudents[key] = [];
        });
        return newStudents;
      }
    });
  };

  const updateStudentType = (course, rollNumber, newType) => {
    setStudents(prev => {
      const newStudents = { ...prev };
      if (newStudents[course]) {
        newStudents[course] = newStudents[course].map(student => 
          student.roll === rollNumber ? { ...student, type: newType } : student
        );
      }
      return newStudents;
    });
  };

  const getStudentsByClass = (className) => {
    return students[className] || [];
  };

  const getAllStudents = () => {
    return Object.values(students).flat();
  };

  return (
    <DataContext.Provider
      value={{ 
        students, 
        setStudents, 
        attendance, 
        setAttendance, 
        feedback, 
        setFeedback, 
        smsHistory, 
        setSmsHistory, 
        addStudent,
        updateStudent,
        deleteStudent,
        deleteAllStudents,
        updateStudentType,
        getStudentsByClass,
        getAllStudents,
        subjectMapping,
        needsSync,
        syncDataAcrossComponents,
        syncWithBackend
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

// Create a custom hook to use the data context
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export default DataProvider; 