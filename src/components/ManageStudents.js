import React, { useState, useContext } from 'react';
import { DataContext } from '../context/DataContext';
import NavbarComponent from './Navbar';

const ManageStudents = () => {
  const { students, addStudent, updateStudent, deleteStudent, deleteAllStudents } = useContext(DataContext);
  const [formData, setFormData] = useState({ roll: '', name: '', course: '', type: '', parentName: '', parentPhone: '' });
  const [editing, setEditing] = useState(false);
  const [editingCourse, setEditingCourse] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');

  // Ensure we always have the 3 required courses available in the dropdown,
  // even if the students object from localStorage is empty
  const availableCourses = [...new Set([
    ...Object.keys(students),
    'Electrical Machine-II',
    'Digital Electronics',
    'Power System-II'
  ])];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.roll || !formData.name || !formData.course || !formData.type) {
      alert('Please fill in all required fields');
      return;
    }

    // Create student object
    const newStudent = {
      roll: formData.roll,
      name: formData.name,
      type: formData.type,
      parentName: formData.parentName || '',
      parentPhone: formData.parentPhone || ''
    };

    if (editing) {
      // Update existing student
      updateStudent(editingCourse, formData.roll, {
        name: formData.name,
        type: formData.type,
        parentName: formData.parentName || '',
        parentPhone: formData.parentPhone || ''
      });
      console.log('Student updated successfully');
    } else {
      // Add new student
      addStudent(formData.course, newStudent);
      console.log('Student added successfully');
    }

    // Reset form
    resetForm();
  };

  const resetForm = () => {
    setFormData({ roll: '', name: '', course: '', type: '', parentName: '', parentPhone: '' });
    setEditing(false);
    setEditingCourse('');
  };

  const handleEdit = (student, course) => {
    setFormData({
      roll: student.roll,
      name: student.name,
      course: course,
      type: student.type,
      parentName: student.parentName || '',
      parentPhone: student.parentPhone || ''
    });
    setEditing(true);
    setEditingCourse(course);
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (roll, course) => {
    if (window.confirm(`Are you sure you want to delete student with roll number ${roll}?`)) {
      deleteStudent(course, roll);
    }
  };

  // Function to handle deleting all students
  const handleDeleteAll = () => {
    if (window.confirm(`Are you sure you want to delete ALL student records? This action cannot be undone.`)) {
      if (selectedCourse) {
        // Delete students from selected course
        deleteAllStudents(selectedCourse);
        alert(`All students from ${selectedCourse} have been removed.`);
      } else {
        // Delete students from all courses
        deleteAllStudents();
        alert('All students from all courses have been removed.');
      }
    }
  };

  return (
    <>
      <NavbarComponent userRole="admin" />
      <div className="container mt-4">
        <h2 className="text-center mb-4">Manage Students</h2>
        
        {/* Delete All Students Section */}
        <div className="card p-4 mb-4 bg-light">
          <h4>Remove Student Records</h4>
          <div className="row g-3 align-items-end">
            <div className="col-md-8">
              <label className="form-label">Select Course (optional)</label>
              <select 
                className="form-select" 
                value={selectedCourse} 
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                <option value="">All Courses</option>
                {availableCourses.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <button 
                className="btn btn-danger w-100" 
                onClick={handleDeleteAll}
                disabled={Object.values(students).flat().length === 0}
              >
                {selectedCourse ? `Clear ${selectedCourse} Students` : 'Clear All Students'}
              </button>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="card p-4 mb-4">
          <div className="row">
            <div className="col-md-6 mb-3">
              <input 
                className="form-control" 
                placeholder="Roll Number" 
                value={formData.roll} 
                onChange={(e) => setFormData({ ...formData, roll: e.target.value })}
                readOnly={editing} // Roll number shouldn't be editable when editing
              />
            </div>
            <div className="col-md-6 mb-3">
              <input className="form-control" placeholder="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="col-md-6 mb-3">
              <select 
                className="form-select" 
                value={formData.course} 
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                disabled={editing} // Course shouldn't be editable when editing
              >
                <option value="">Select Course</option>
                {availableCourses.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <select className="form-select" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                <option value="">Select Type</option>
                <option value="normal">Normal</option>
                <option value="slow">Slow</option>
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <input className="form-control" placeholder="Parent Name" value={formData.parentName} onChange={(e) => setFormData({ ...formData, parentName: e.target.value })} />
            </div>
            <div className="col-md-6 mb-3">
              <input className="form-control" placeholder="Parent Phone" value={formData.parentPhone} onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })} />
            </div>
          </div>
          <div className="d-flex">
            <button type="submit" className="btn btn-primary me-2">
              {editing ? 'Update Student' : 'Add Student'}
            </button>
            {editing && (
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
        <table className="table">
          <thead>
            <tr>
              <th>Roll</th>
              <th>Name</th>
              <th>Course</th>
              <th>Type</th>
              <th>Parent Name</th>
              <th>Parent Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(students).flatMap(([course, courseStudents]) =>
              courseStudents.map((student) => (
                <tr key={`${course}-${student.roll}`}>
                  <td>{student.roll}</td>
                  <td>{student.name}</td>
                  <td>{course}</td>
                  <td>{student.type}</td>
                  <td>{student.parentName}</td>
                  <td>{student.parentPhone}</td>
                  <td>
                    <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(student, course)}>
                      Edit
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(student.roll, course)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ManageStudents; 