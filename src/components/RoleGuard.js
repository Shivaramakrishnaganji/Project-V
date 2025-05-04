import React from 'react';
import { Navigate } from 'react-router-dom';

const RoleGuard = ({ children, allowedRoles }) => {
  // Get user role directly from localStorage
  const userRole = localStorage.getItem('userRole');
  
  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

export default RoleGuard; 