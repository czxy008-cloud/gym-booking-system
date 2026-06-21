import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import StarRating from '../components/StarRating.jsx';
import { reviewAPI, bookingAPI } from '../services/api';
import { formatDate, getStatusText, getStatusBadgeClass } from '../utils/dateUtils';
import { useAuth } from '../context/AuthContext.jsx';
import './ReviewsPage.css';

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchReviews();

    const params = new URLSearchParams(location.search);
    const bookingId = params.get('bookingId');
    if (bookingId) {
      fetchBookingForReview(bookingId);
    }
  }, [activeTab, user]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      let status;
      if (activeTab === 'pending') status = 'pending';
      else if (activeTab === 'approved') status = 'approved';
      else if (activeTab === 'rejected') status = 'rejected';

      const response = await reviewAPI.getMyReviews({
        status: status || undefined,
        limit: 20,
      });
      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error('获取评价列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingForReview = async (bookingId) => {
    try {
      const response = await bookingAPI.getById(bookingId);
      setSelectedBooking(response.data);
      setShowReviewModal(true);
    } catch (error) {
      console.error('获取预约信息失败:', error);
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedBooking) return;

    if (!content.trim()) {
      alert('请填写评价内容');
      return;
    }

    try {
      setSubmitting(true);
      const response = await reviewAPI.create({
        bookingId: selectedBooking._id,
        rating,
        content,
      });
      alert(response.data.message || '评价提交成功！');
      setShowReviewModal(false);
      setContent('');
      setRating(5);
      setSelectedBooking(null);
      fetchReviews();
      navigate('/reviews', { replace: true });
    } catch (error) {
      alert(error.response?.data?.message || '提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  const tabs = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待审核' },
    { key: 'approved', label: '已通过' },
    { key: 'rejected', label: '已驳回' },
  ];

  return (
    <div className="reviews-page container">
      <div className="page-header">
        <h1>我的评价</h1>
        <p>查看和管理您的课程评价</p>
      </div>

      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading">加载中...</div>
      ) : reviews.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">⭐</div>
          <p>暂无评价记录</p>
          <p className="empty-hint">完成课程后可以对教练进行评价</p>
        </div>
      ) : (
        <div className="review-list">
          {reviews.map((review) => (
            <div key={review._id} className="review-card">
              <div className="review-header">
                <div className="review-coach">
                  <div className="coach-avatar-small">
                    {review.coach?.name?.charAt(0) || '教'}
                  </div>
                  <div>
                    <div className="coach-name">{review.coach?.name || '教练'}</div>
                    <div className="review-date">
                      {formatDate(review.createdAt, 'YYYY-MM-DD HH:mm')}
                    </div>
                  </div>
                </div>
                <span className={`badge ${getStatusBadgeClass(review.status)}`}>
                  {getStatusText(review.status)}
                </span>
              </div>

              <div className="review-rating">
                <StarRating rating={review.rating} readonly size="md" />
                <span className="rating-score">{review.rating} 分</span>
              </div>

              {review.content && (
                <div className="review-content">
                  {review.content}
                </div>
              )}

              {review.tags && review.tags.length > 0 && (
                <div className="review-tags">
                  {review.tags.map((tag, i) => (
                    <span key={i} className="review-tag">{tag}</span>
                  ))}
                </div>
              )}

              {review.status === 'rejected' && (
                <div className="review-reject-reason">
                  评价未通过审核
                </div>
              )}

              {review.reply && (
                <div className="review-reply">
                  <div className="reply-label">教练回复：</div>
                  <div className="reply-content">{review.reply}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showReviewModal && selectedBooking && (
        <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>评价课程</h3>
              <button className="modal-close" onClick={() => setShowReviewModal(false)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="review-course-info">
                <div className="info-row">
                  <span className="info-label">课程类型</span>
                  <span className="info-value">
                    {selectedBooking.courseSlot?.courseType || '课程'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">教练</span>
                  <span className="info-value">{selectedBooking.coach?.name || '教练'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">时间</span>
                  <span className="info-value">
                    {formatDate(selectedBooking.courseSlot?.date, 'MM月DD日')}
                    {' '}
                    {selectedBooking.courseSlot?.startTime}
                  </span>
                </div>
              </div>

              <div className="rating-section">
                <label>
                  <span className="rating-label">评分</span>
                  <div className="rating-input">
                    <StarRating rating={rating} onRate={setRating} size="lg" />
                    <span className="rating-text">{rating} 分</span>
                  </div>
                </label>
              </div>

              <div className="input-wrapper">
                <label>评价内容</label>
                <textarea
                  className="input textarea"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="分享您的课程体验，帮助其他学员选择合适的教练"
                  rows={4}
                  maxLength={500}
                />
                <span className="char-count">{content.length}/500</span>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowReviewModal(false)}
              >
                取消
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSubmitReview}
                disabled={submitting}
              >
                {submitting ? '提交中...' : '提交评价'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsPage;
