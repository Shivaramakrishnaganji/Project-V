import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import './styles.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// Context Provider
import DataProvider from './context/DataContext';

// Components
import Login from './components/Login';
import Homepage from './components/Homepage';
import Attendance from './components/Attendance';
import Summary from './components/Summary';
import ManageStudents from './components/ManageStudents';
import ManageStudentTypes from './components/ManageStudentTypes';
import DownloadReports from './components/DownloadReports';
import RoleGuard from './components/RoleGuard';
import Navbar from './components/Navbar';

const App = () => {
  return (
    <DataProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/homepage" element={<Homepage />} />
          <Route path="/attendance" element={<RoleGuard allowedRoles={['faculty']}><Attendance /></RoleGuard>} />
          <Route path="/summary" element={<RoleGuard allowedRoles={['faculty']}><Summary /></RoleGuard>} />
          <Route path="/manage-students" element={<RoleGuard allowedRoles={['admin']}><ManageStudents /></RoleGuard>} />
          <Route path="/manage-student-types" element={<RoleGuard allowedRoles={['admin', 'faculty']}><ManageStudentTypes /></RoleGuard>} />
          <Route path="/download-reports" element={<RoleGuard allowedRoles={['admin']}><DownloadReports /></RoleGuard>} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </DataProvider>
  );
};

export default App;
