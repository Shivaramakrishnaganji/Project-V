import React, { useState, useContext } from 'react';
import { DataContext } from '../context/DataContext';
import Navbar from './Navbar';

const ManageStudentTypes = () => {
  const { students, setStudents } = useContext(DataContext);
  const [course, setCourse] = useState('');
  const [updates, setUpdates] = useState({});
  
  // Ensure we always have the required courses available
  const availableCourses = [...new Set([
    ...Object.keys(students),
    'Electrical Machine-II',
    'Digital Electronics',
    'Power System-II'
  ])];

  const handleSave = () => {
    setStudents((prev) => {
      const newStudents = { ...prev };
      newStudents[course] = newStudents[course].map((student) => ({
        ...student,
        type: updates[student.roll]?.type || student.type,
        parentName: updates[student.roll]?.parentName || student.parentName,
        parentPhone: updates[student.roll]?.parentPhone || student.parentPhone,
      }));
      return newStudents;
    });
    alert('Student types updated!');
  };

  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <h2 className="text-center mb-4">Manage Student Types</h2>
        <select className="form-select mb-4" value={course} onChange={(e) => setCourse(e.target.value)}>
          <option value="">Select Course</option>
          {availableCourses.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        {course && (
          <div>
            <table className="table">
              <thead>
                <tr>
                  <th>Roll</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Parent Name</th>
                  <th>Parent Phone</th>
                </tr>
              </thead>
              <tbody>
                {students[course].map((student) => (
                  <tr key={student.roll}>
                    <td>{student.roll}</td>
                    <td>{student.name}</td>
                    <td>
                      <select
                        className="form-select"
                        value={updates[student.roll]?.type || student.type}
                        onChange={(e) => setUpdates({ ...updates, [student.roll]: { ...updates[student.roll], type: e.target.value } })}
                      >
                        <option value="slow">Slow</option>
                        <option value="normal">Normal</option>
                      </select>
                    </td>
                    <td>
                      <input
                        className="form-control"
                        value={updates[student.roll]?.parentName || student.parentName}
                        onChange={(e) => setUpdates({ ...updates, [student.roll]: { ...updates[student.roll], parentName: e.target.value } })}
                      />
                    </td>
                    <td>
                      <input
                        className="form-control"
                        value={updates[student.roll]?.parentPhone || student.parentPhone}
                        onChange={(e) => setUpdates({ ...updates, [student.roll]: { ...updates[student.roll], parentPhone: e.target.value } })}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
          </div>
        )}
      </div>
    </>
  );
};

export default ManageStudentTypes; 