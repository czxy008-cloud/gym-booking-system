import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="logo">
          <span className="logo-icon">🏋️</span>
          <span className="logo-text">健身房预约系统</span>
        </Link>

        <div className="nav-links">
          <Link to="/" className="nav-link">
            课表
          </Link>
          <Link to="/coaches" className="nav-link">
            教练
          </Link>
          {user && (
            <>
              <Link to="/bookings" className="nav-link">
                我的预约
              </Link>
              <Link to="/reviews" className="nav-link">
                我的评价
              </Link>
              {user.role === 'admin' && (
                <div className="nav-dropdown">
                  <span className="nav-link dropdown-trigger">
                    管理后台 ▾
                  </span>
                  <div className="dropdown-menu">
                    <Link to="/admin/courses" className="dropdown-item">
                      课程排期管理
                    </Link>
                    <Link to="/admin/reviews" className="dropdown-item">
                      评价审核
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="nav-actions">
          {user ? (
            <div className="user-menu">
              <Link to="/profile" className="user-info">
                <div className="user-avatar">
                  {user.name?.charAt(0) || '会'}
                </div>
                <span className="user-name">{user.name}</span>
              </Link>
              <span className="sessions-badge">
                剩余 {user.remainingSessions || 0} 课时
              </span>
              <button className="logout-btn" onClick={handleLogout}>
                退出
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-outline btn-sm">
                登录
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                注册
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
