import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const userRole = localStorage.getItem('userRole');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/homepage">Vignan Portal</Link>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav ms-auto">
            {userRole === 'admin' && (
              <>
                <li className="nav-item"><Link className="nav-link" to="/manage-students">Manage Students</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/manage-student-types">Manage Types</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/download-reports">Reports</Link></li>
              </>
            )}
            {userRole === 'faculty' && (
              <>
                <li className="nav-item"><Link className="nav-link" to="/attendance">Attendance</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/summary">Summary</Link></li>
              </>
            )}
            <li className="nav-item">
              <button className="nav-link btn btn-link" onClick={handleLogout}>Logout</button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 