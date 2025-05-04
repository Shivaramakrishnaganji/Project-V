import React, { useState, useContext } from 'react';
import { DataContext } from '../context/DataContext';
import NavbarComponent from './Navbar';

const Attendance = () => {
  const { students, attendance, setAttendance } = useContext(DataContext);
  const [course, setCourse] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [hour, setHour] = useState('');
  const [studentStatuses, setStudentStatuses] = useState({});
  const [userRole, setUserRole] = useState('faculty');

  // Ensure we always have the required courses available
  const availableCourses = [...new Set([
    ...Object.keys(students),
    'Electrical Machine-II',
    'Digital Electronics',
    'Power System-II'
  ])];

  // Get user info from localStorage
  React.useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(user.role || 'faculty');
  }, []);

  const handleLoadStudents = (e) => {
    e.preventDefault();
    if (!course) {
      alert('Please select a course');
      return;
    }
    const courseStudents = students[course] || [];
    const statuses = {};
    courseStudents.forEach((student) => {
      statuses[student.roll] = 'present';
    });
    setStudentStatuses(statuses);
  };

  const handleSaveAttendance = () => {
    // Validate required fields
    if (!course || !date || !hour) {
      alert('Please fill in all required fields');
      return;
    }

    // Create attendance records, defaulting to absent if not explicitly marked
    const records = students[course].map((student) => ({
      roll: student.roll,
      name: student.name,
      type: student.type,
      status: studentStatuses[student.roll] || 'absent', // Default to absent if not set
    }));

    // Add timestamp to the attendance record
    const newAttendance = {
      course,
      date,
      hour,
      records,
      timestamp: new Date().toISOString()
    };
    
    // Count present and absent students for logging
    const presentCount = records.filter(r => r.status === 'present').length;
    const absentCount = records.filter(r => r.status === 'absent').length;
    
    // Save the attendance
    setAttendance([...attendance, newAttendance]);
    
    console.log(`Attendance saved for ${course} on ${date}, hour ${hour}`);
    console.log(`Present: ${presentCount}, Absent: ${absentCount}`);
    console.log('Student attendance status details:', records.map(r => `${r.name} (${r.roll}): ${r.status}`));
    
    alert('Attendance saved successfully!');
    
    // Reset form
    setCourse('');
    setStudentStatuses({});
  };

  // Add a function to mark all students as absent
  const markAllAbsent = () => {
    if (!course || !students[course]) return;
    
    const allAbsent = {};
    students[course].forEach(student => {
      allAbsent[student.roll] = 'absent';
    });
    
    setStudentStatuses(allAbsent);
    console.log('Marked all students as absent');
  };

  return (
    <>
      <NavbarComponent userRole={userRole} />
      <div className="container mt-4">
        <h2 className="text-center mb-4">Attendance</h2>
        <form onSubmit={handleLoadStudents} className="mb-4">
          <div className="row g-3">
            <div className="col-md-3">
              <select className="form-select" value={course} onChange={(e) => setCourse(e.target.value)}>
                <option value="">Select Course</option>
                {availableCourses.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <input type="date" className="form-control" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="col-md-3">
              <select className="form-select" value={hour} onChange={(e) => setHour(e.target.value)}>
                <option value="">Select Hour</option>
                {[1, 2, 3, 4, 5, 6].map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <button type="submit" className="btn btn-primary w-100">Load Students</button>
            </div>
          </div>
        </form>
        {course && students[course] && (
          <div>
            <div className="d-flex justify-content-between mb-3">
              <button 
                className="btn btn-warning" 
                onClick={markAllAbsent} 
                type="button"
              >
                Mark All Absent
              </button>
            </div>
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Roll</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {students[course].map((student) => (
                  <tr key={student.roll}>
                    <td>{student.roll}</td>
                    <td>{student.name}</td>
                    <td>{student.type}</td>
                    <td>
                      <div className="form-check form-check-inline">
                        <input
                          type="radio"
                          name={`status_${student.roll}`}
                          value="present"
                          checked={studentStatuses[student.roll] === 'present'}
                          onChange={() => setStudentStatuses({ ...studentStatuses, [student.roll]: 'present' })}
                        />
                        <label>Present</label>
                      </div>
                      <div className="form-check form-check-inline">
                        <input
                          type="radio"
                          name={`status_${student.roll}`}
                          value="absent"
                          checked={studentStatuses[student.roll] === 'absent'}
                          onChange={() => setStudentStatuses({ ...studentStatuses, [student.roll]: 'absent' })}
                        />
                        <label>Absent</label>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="btn btn-primary" onClick={handleSaveAttendance}>Save Attendance</button>
          </div>
        )}
      </div>
    </>
  );
};

export default Attendance; 