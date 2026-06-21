import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { authAPI, bookingAPI } from '../services/api';
import { formatDate } from '../utils/dateUtils';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, logout, updateUser, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    avatar: '',
  });
  const [stats, setStats] = useState(null);
  const [saving, setSaving] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setFormData({
      name: user.name || '',
      avatar: user.avatar || '',
    });
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      const response = await bookingAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('获取统计数据失败:', error);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await authAPI.updateProfile(formData);
      updateUser(response.data);
      setEditing(false);
      alert('个人信息更新成功');
    } catch (error) {
      alert(error.response?.data?.message || '更新失败');
    } finally {
      setSaving(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      setCheckingIn(true);
      const response = await authAPI.checkIn();
      alert(response.data.message || '打卡成功！');
      fetchStats();
      refreshProfile();
    } catch (error) {
      alert(error.response?.data?.message || '打卡失败');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('确定要退出登录吗？')) {
      logout();
      navigate('/login');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="profile-page container">
      <div className="page-header">
        <h1>个人中心</h1>
        <p>管理您的账户信息</p>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} />
              ) : (
                <span>{user.name?.charAt(0) || '会'}</span>
              )}
            </div>
            <div className="profile-info">
              <h2 className="profile-name">{user.name}</h2>
              <p className="profile-phone">{user.phone}</p>
              <div className="membership-badge">
                {user.membershipType || '次卡会员'}
              </div>
            </div>
            <button
              className="btn btn-outline btn-sm edit-btn"
              onClick={() => setEditing(!editing)}
            >
              {editing ? '取消' : '编辑'}
            </button>
          </div>

          {editing ? (
            <div className="profile-edit">
              <div className="input-wrapper">
                <label>姓名</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <button
                className="btn btn-primary btn-block"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          ) : (
            <div className="profile-details">
              <div className="detail-row">
                <span className="detail-label">会员类型</span>
                <span className="detail-value">{user.membershipType || '次卡'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">剩余课时</span>
                <span className="detail-value highlight">
                  {stats?.remainingSessions ?? user.remainingSessions ?? 0} 次
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">总课时</span>
                <span className="detail-value">
                  {stats?.totalSessions ?? user.totalSessions ?? 0} 次
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">累计打卡</span>
                <span className="detail-value">
                  {stats?.totalCheckIns ?? 0} 次
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">完成课程</span>
                <span className="detail-value">
                  {stats?.completedBookings ?? 0} 节
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">注册时间</span>
                <span className="detail-value">
                  {formatDate(user.createdAt || new Date(), 'YYYY-MM-DD')}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="action-section">
          <button
            className="action-card checkin-card"
            onClick={handleCheckIn}
            disabled={checkingIn}
          >
            <div className="action-icon">📋</div>
            <div className="action-text">
              <h3>今日打卡</h3>
              <p>签到进入健身房</p>
            </div>
          </button>

          <div
            className="action-card booking-card"
            onClick={() => navigate('/bookings')}
          >
            <div className="action-icon">📅</div>
            <div className="action-text">
              <h3>我的预约</h3>
              <p>查看和管理预约</p>
            </div>
          </div>

          <div
            className="action-card review-card"
            onClick={() => navigate('/reviews')}
          >
            <div className="action-icon">⭐</div>
            <div className="action-text">
              <h3>我的评价</h3>
              <p>查看历史评价记录</p>
            </div>
          </div>
        </div>

        <button className="logout-btn-full" onClick={handleLogout}>
          退出登录
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
