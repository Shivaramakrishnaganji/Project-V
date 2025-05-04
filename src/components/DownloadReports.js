import React, { useState, useContext } from 'react';
import * as XLSX from 'xlsx';
import { DataContext } from '../context/DataContext';
import NavbarComponent from './Navbar';

const DownloadReports = () => {
  const { students, attendance, feedback } = useContext(DataContext);
  const [course, setCourse] = useState('');
  const [reportType, setReportType] = useState('summary');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Ensure we always have the required courses available
  const availableCourses = [...new Set([
    ...Object.keys(students),
    'Electrical Machine-II',
    'Digital Electronics',
    'Power System-II'
  ])];

  const downloadSummaryReport = () => {
    // Filter feedback records by course if course is selected
    let filteredFeedback = [...feedback];
    
    if (course) {
      filteredFeedback = filteredFeedback.filter(f => f.subjectName === course);
    }
    
    // Filter by date range if dates are provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      filteredFeedback = filteredFeedback.filter(f => {
        const feedbackDate = new Date(f.date);
        return feedbackDate >= start && feedbackDate <= end;
      });
    }
    
    // Prepare headers for the Excel file
    const data = [
      [
        'Date', 
        'Roll Number', 
        'Student Name', 
        'Type', 
        'Subject',
        'Topic',
        'Content Delivery (1-5)',
        'Communication (1-5)',
        'Body Language (1-5)',
        'Notes Followed',
        'Feedback Percentage (%)',
        'SMS Status'
      ]
    ];
    
    // Add feedback data rows
    filteredFeedback.forEach(f => {
      // Find student SMS status (for demonstration - could be tracked in real app)
      const smsStatus = f.smsSent ? 'Sent' : 'Not Sent';
      
      data.push([
        new Date(f.date).toLocaleDateString(),
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
        smsStatus
      ]);
    });
    
    // Create and download Excel file
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Summary Report');
    
    // Set column widths for better readability
    const colWidths = [
      { wch: 12 }, // Date
      { wch: 12 }, // Roll
      { wch: 20 }, // Name
      { wch: 8 },  // Type
      { wch: 25 }, // Subject
      { wch: 25 }, // Topic
      { wch: 18 }, // Content Delivery
      { wch: 18 }, // Communication
      { wch: 18 }, // Body Language
      { wch: 14 }, // Notes Followed
      { wch: 20 }, // Feedback %
      { wch: 12 }  // SMS Status
    ];
    ws['!cols'] = colWidths;
    
    // Generate filename
    const filename = course 
      ? `${course}_summary_report.xlsx` 
      : 'all_courses_summary_report.xlsx';
    
    XLSX.writeFile(wb, filename);
  };

  const downloadAttendanceReport = () => {
    // Filter attendance records by course
    const courseAttendance = attendance.filter((a) => a.course === course);
    
    // Prepare headers for the Excel file
    const data = [['Date', 'Hour', 'Roll Number', 'Student Name', 'Status', 'Type']];
    
    // Add attendance data rows
    courseAttendance.forEach((record) => {
      record.records.forEach((student) => {
        data.push([
          record.date, 
          record.hour, 
          student.roll, 
          student.name, 
          student.status, 
          student.type
        ]);
      });
    });
    
    // Create and download Excel file
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
    XLSX.writeFile(wb, `${course}_attendance_report.xlsx`);
  };

  return (
    <>
      <NavbarComponent userRole="admin" />
      <div className="container mt-4">
        <h2 className="text-center mb-4">Download Reports</h2>
        
        <div className="card mb-4">
          <div className="card-body">
            <h4 className="card-title">Generate Report</h4>
            
            <div className="mb-3">
              <label className="form-label">Report Type</label>
              <select 
                className="form-select" 
                value={reportType} 
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="summary">Summary Report</option>
                <option value="attendance">Attendance Report</option>
              </select>
            </div>
            
            <div className="mb-3">
              <label className="form-label">Course</label>
              <select 
                className="form-select" 
                value={course} 
                onChange={(e) => setCourse(e.target.value)}
              >
                <option value="">All Courses</option>
                {availableCourses.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            
            {reportType === 'summary' && (
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Start Date (Optional)</label>
                  <input
                    type="date"
                    className="form-control"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">End Date (Optional)</label>
                  <input
                    type="date"
                    className="form-control"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            )}
            
            <div className="d-grid">
              {reportType === 'summary' ? (
                <button 
                  className="btn btn-primary" 
                  onClick={downloadSummaryReport}
                >
                  Download Summary Report
                </button>
              ) : (
                <button 
                  className="btn btn-primary" 
                  onClick={downloadAttendanceReport} 
                  disabled={!course}
                >
                  Download Attendance Report
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div className="alert alert-info">
          <h5>Report Information</h5>
          <p className="mb-0">
            {reportType === 'summary' 
              ? 'The Summary Report includes student feedback data, performance metrics, and communication records.'
              : 'The Attendance Report shows student attendance records for the selected course.'
            }
          </p>
        </div>
      </div>
    </>
  );
};

export default DownloadReports; 