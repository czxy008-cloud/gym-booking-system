import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './AuthPages.css';

const LoginPage = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(phone, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || '登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">🏋️</div>
          <h1>欢迎回来</h1>
          <p>登录您的健身房账户</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}

          <div className="input-wrapper">
            <label>手机号</label>
            <input
              type="tel"
              className="input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="请输入手机号"
              required
            />
          </div>

          <div className="input-wrapper">
            <label>密码</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <div className="auth-footer">
          还没有账户？
          <Link to="/register" className="auth-link">
            立即注册
          </Link>
        </div>

        <div className="auth-hint">
          <p>测试账号：13900000001 / 123456</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
