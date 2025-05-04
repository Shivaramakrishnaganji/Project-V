import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import vignanLogo from '../assets/Vignan_logo.png';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin123') {
      // Store user info in localStorage
      localStorage.setItem('user', JSON.stringify({ username, role: 'admin' }));
      localStorage.setItem('userRole', 'admin');
      navigate('/homepage');
    } else if (username === 'shiva' && password === 'shiva123') {
      // Store user info in localStorage
      localStorage.setItem('user', JSON.stringify({ username, role: 'faculty' }));
      localStorage.setItem('userRole', 'faculty');
      navigate('/homepage');
    } else {
      alert('Invalid credentials');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card login-card shadow-lg p-3 mb-5 bg-white rounded" style={{ width: '400px' }}>
        <div className="card-body">
          <div className="text-center mb-4">
            <img src={vignanLogo} alt="Vignan Logo" className="logo mb-3" style={{ maxWidth: '150px', height: 'auto' }} />
            <h2 className="text-center">Vignan Student Attendance Portal</h2>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                type="text"
                className="form-control input-field"
                id="uname"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="mb-3 position-relative">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control input-field"
                id="pass"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <i 
                className={`fas fa-eye${showPassword ? '-slash' : ''} toggle-password`} 
                onClick={togglePasswordVisibility}
                style={{ 
                  position: 'absolute', 
                  right: '10px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  cursor: 'pointer'
                }}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </i>
            </div>
            <button type="submit" className="btn btn-primary w-100 login-btn">Login</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login; 