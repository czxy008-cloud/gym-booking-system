import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './AuthPages.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
    membershipType: '次卡',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (formData.password.length < 6) {
      setError('密码长度至少6位');
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name,
        phone: formData.phone,
        password: formData.password,
        membershipType: formData.membershipType,
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || '注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">🏋️</div>
          <h1>创建账户</h1>
          <p>加入我们，开启健身之旅</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}

          <div className="input-wrapper">
            <label>姓名</label>
            <input
              type="text"
              name="name"
              className="input"
              value={formData.name}
              onChange={handleChange}
              placeholder="请输入姓名"
              required
            />
          </div>

          <div className="input-wrapper">
            <label>手机号</label>
            <input
              type="tel"
              name="phone"
              className="input"
              value={formData.phone}
              onChange={handleChange}
              placeholder="请输入手机号"
              required
            />
          </div>

          <div className="input-wrapper">
            <label>会员类型</label>
            <select
              name="membershipType"
              className="input"
              value={formData.membershipType}
              onChange={handleChange}
            >
              <option value="次卡">次卡 (10次)</option>
              <option value="月卡">月卡 (30次)</option>
              <option value="季卡">季卡 (90次)</option>
              <option value="年卡">年卡 (365次)</option>
            </select>
          </div>

          <div className="input-wrapper">
            <label>密码</label>
            <input
              type="password"
              name="password"
              className="input"
              value={formData.password}
              onChange={handleChange}
              placeholder="请输入密码（至少6位）"
              required
            />
          </div>

          <div className="input-wrapper">
            <label>确认密码</label>
            <input
              type="password"
              name="confirmPassword"
              className="input"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="请再次输入密码"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? '注册中...' : '注册'}
          </button>
        </form>

        <div className="auth-footer">
          已有账户？
          <Link to="/login" className="auth-link">
            立即登录
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
