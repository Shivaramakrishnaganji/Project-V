import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

const Navigation = ({ userRole }) => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to={userRole === 'admin' ? '/admin' : '/faculty'}>
          Vignan Attendance Portal
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {userRole === 'admin' ? (
              // Admin Navigation Links
              <>
                <Nav.Link as={Link} to="/admin">Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/admin/students">Student Management</Nav.Link>
                <Nav.Link as={Link} to="/admin/reports">Reports</Nav.Link>
              </>
            ) : (
              // Faculty Navigation Links
              <>
                <Nav.Link as={Link} to="/faculty">Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/faculty/attendance">Attendance</Nav.Link>
                <Nav.Link as={Link} to="/faculty/feedback">Feedback</Nav.Link>
              </>
            )}
          </Nav>
          <Nav>
            <Button 
              variant="outline-light" 
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation; 