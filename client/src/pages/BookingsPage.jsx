import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StarRating from '../components/StarRating.jsx';
import { bookingAPI } from '../services/api';
import { formatDate, getStatusText, getStatusBadgeClass } from '../utils/dateUtils';
import './BookingsPage.css';
import { useAuth } from '../context/AuthContext.jsx';

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchBookings();
    fetchStats();
  }, [activeTab, user]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      let status;
      if (activeTab === 'upcoming') status = 'booked';
      else if (activeTab === 'completed') status = 'completed';
      else if (activeTab === 'cancelled') status = 'cancelled';

      const response = await bookingAPI.getMyBookings({
        status: status || undefined,
        limit: 20,
      });
      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error('获取预约列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await bookingAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('获取统计数据失败:', error);
    }
  };

  const handleCancel = async (booking) => {
    if (!booking.canCancelFreeOfCharge) {
      const confirmed = window.confirm(
        '距离开课不足24小时，取消将扣除课时不予退还。确定要取消吗？'
      );
      if (!confirmed) return;
    } else {
      const confirmed = window.confirm('确定要取消此预约吗？');
      if (!confirmed) return;
    }

    try {
      const response = await bookingAPI.cancel(booking._id);
      alert(response.data.message);
      fetchBookings();
      fetchStats();
      refreshProfile();
    } catch (error) {
      alert(error.response?.data?.message || '取消失败');
    }
  };

  const handleCheckIn = async (bookingId) => {
    try {
      const response = await bookingAPI.checkIn(bookingId);
      alert(response.data.message);
      fetchBookings();
      fetchStats();
    } catch (error) {
      alert(error.response?.data?.message || '签到失败');
    }
  };

  const handleReview = (booking) => {
    navigate(`/reviews/new?bookingId=${booking._id}`);
  };

  const tabs = [
    { key: 'upcoming', label: '待上课', count: stats?.upcomingBookings || 0 },
    { key: 'completed', label: '已完成', count: stats?.completedBookings || 0 },
    { key: 'cancelled', label: '已取消', count: stats?.cancelledBookings || 0 },
    { key: 'all', label: '全部', count: stats?.totalBookings || 0 },
  ];

  return (
    <div className="bookings-page container">
      <div className="page-header">
        <h1>我的预约</h1>
        <p>管理您的课程预约</p>
      </div>

      {stats && (
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-value">{stats.remainingSessions}</div>
            <div className="stat-label">剩余课时</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.upcomingBookings}</div>
            <div className="stat-label">待上课</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.completedBookings}</div>
            <div className="stat-label">已完成</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalCheckIns || 0}</div>
            <div className="stat-label">累计打卡</div>
          </div>
        </div>
      )}

      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            <span className="tab-count">{tab.count}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading">加载中...</div>
      ) : bookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <p>暂无预约记录</p>
          <button className="btn btn-primary mt-4" onClick={() => navigate('/')}>
            去预约课程
          </button>
        </div>
      ) : (
        <div className="booking-list">
          {bookings.map((booking) => (
            <div key={booking._id} className="booking-card">
              <div className="booking-header">
                <div className="booking-course">
                  <span className="course-type-tag">
                    {booking.courseSlot?.courseType || '课程'}
                  </span>
                  <span className={`badge ${getStatusBadgeClass(booking.status)}`}>
                    {getStatusText(booking.status)}
                  </span>
                </div>
                <div className="booking-price">¥{booking.price}</div>
              </div>

              <div className="booking-body">
                <div className="booking-time">
                  <div className="time-info">
                    <span className="label">时间</span>
                    <span className="value">
                      {formatDate(booking.courseSlot?.date, 'MM月DD日')}
                      {' '}{booking.courseSlot?.startTime} - {booking.courseSlot?.endTime}
                    </span>
                  </div>
                </div>

                <div className="booking-coach">
                  <span className="label">教练</span>
                  <span className="value">{booking.coach?.name || '未知'}</span>
                </div>

                <div className="booking-location">
                  <span className="label">地点</span>
                  <span className="value">{booking.courseSlot?.location || '私教区'}</span>
                </div>
              </div>

              {booking.status === 'booked' && !booking.canCancelFreeOfCharge && (
                <div className="cancel-warning">
                  注意：距开课不足24小时，取消将扣除课时
                </div>
              )}

              {booking.status === 'booked' && (
                <div className="cancellation-deadline">
                  免费取消截止：{booking.cancellationDeadline}
                </div>
              )}

              {booking.review && (
                <div className="booking-review-preview">
                  <div className="review-label">我的评价：</div>
                  <StarRating rating={booking.review.rating} readonly size="sm" />
                  <span className="review-content-preview">{booking.review.content}</span>
                </div>
              )}

              <div className="booking-footer">
                {booking.status === 'booked' && (
                  <>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleCancel(booking)}
                    >
                      取消预约
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleCheckIn(booking._id)}
                    >
                      签到
                    </button>
                  </>
                )}

                {booking.status === 'completed' && !booking.review && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleReview(booking)}
                  >
                    去评价
                  </button>
                )}

                {booking.status === 'completed' && booking.review && (
                  <span className="reviewed-tag">已评价</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingsPage;
