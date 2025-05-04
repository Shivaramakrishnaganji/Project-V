import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import NavbarComponent from './Navbar';
import { DataContext } from '../context/DataContext';
import { Link } from 'react-router-dom';

const Homepage = () => {
  const { setAttendance } = useContext(DataContext);
  const [userRole, setUserRole] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Get user info from localStorage
    const user = localStorage.getItem('userRole');
    setUserRole(user || '');
    setUsername(user === 'admin' ? 'Admin' : 'Faculty');
  }, []);
  
  // Function to reset all attendance records
  const handleResetAttendance = () => {
    if (window.confirm('Are you sure you want to clear all attendance records? This action cannot be undone.')) {
      // Clear attendance in context
      setAttendance([]);
      
      // Clear attendance in localStorage
      localStorage.removeItem('attendance');
      
      alert('All attendance records have been reset successfully.');
    }
  };

  return (
    <>
      <NavbarComponent userRole={userRole} />
      <Container className="mt-4">
        <Row>
          <Col>
            <Card className="p-4">
              <Card.Body>
                <h4 className="text-muted mb-4">Welcome, {username}!</h4>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col>
            <h2 className="text-center mb-4">Quick Actions</h2>
            <div className="row">
              {userRole === 'faculty' && (
                <>
                  <div className="col-md-4">
                    <div className="card">
                      <div className="card-body text-center">
                        <h5>Attendance</h5>
                        <Link to="/attendance" className="btn btn-primary">Take Attendance</Link>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card">
                      <div className="card-body text-center">
                        <h5>Summary</h5>
                        <Link to="/summary" className="btn btn-primary">View Summary</Link>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {userRole === 'admin' && (
                <>
                  <div className="col-md-6">
                    <div className="card">
                      <div className="card-body text-center">
                        <h5>Manage Students</h5>
                        <Link to="/manage-students" className="btn btn-primary">Manage</Link>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card">
                      <div className="card-body text-center">
                        <h5>Reset Attendance</h5>
                        <button className="btn btn-danger" onClick={handleResetAttendance}>Reset</button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Homepage; 