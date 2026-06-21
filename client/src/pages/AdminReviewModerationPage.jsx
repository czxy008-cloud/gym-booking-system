import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reviewAPI } from '../services/api';
import { formatDate } from '../utils/dateUtils';
import { useAuth } from '../context/AuthContext.jsx';
import StarRating from '../components/StarRating.jsx';
import './AdminPages.css';

const AdminReviewModerationPage = () => {
  const [pendingReviews, setPendingReviews] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchData();
  }, [user, activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'pending') {
        const response = await reviewAPI.getPending();
        setPendingReviews(response.data || []);
      } else {
        const response = await reviewAPI.getList({ limit: 50 });
        setAllReviews(response.data.reviews || []);
      }
    } catch (error) {
      console.error('获取评价列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId) => {
    if (!window.confirm('确定通过这条评价吗？通过后将公开展示并更新教练排名。')) {
      return;
    }
    try {
      setProcessingId(reviewId);
      await reviewAPI.approve(reviewId);
      alert('审核通过');
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || '操作失败');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectClick = (review) => {
    setSelectedReview(review);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedReview) return;
    if (!rejectReason.trim()) {
      alert('请填写拒绝原因');
      return;
    }
    try {
      setProcessingId(selectedReview._id);
      await reviewAPI.reject(selectedReview._id, { reason: rejectReason });
      alert('已拒绝该评价');
      setShowRejectModal(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || '操作失败');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="badge badge-warning">待审核</span>;
      case 'approved':
        return <span className="badge badge-success">已通过</span>;
      case 'rejected':
        return <span className="badge badge-danger">已拒绝</span>;
      default:
        return null;
    }
  };

  const reviews = activeTab === 'pending' ? pendingReviews : allReviews;

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="admin-page container">
      <div className="admin-header">
        <div>
          <h1>评价审核管理</h1>
          <p>审核学员评价内容，确保展示内容的质量</p>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          待审核
          {pendingReviews.length > 0 && (
            <span className="tab-badge">{pendingReviews.length}</span>
          )}
        </button>
        <button
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          全部评价
        </button>
      </div>

      {loading ? (
        <div className="loading">加载中...</div>
      ) : (
        <div>
          {reviews.length === 0 ? (
            <div className="empty-state">
              <p>{activeTab === 'pending' ? '暂无待审核的评价' : '暂无评价数据'}</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review._id} className="review-card">
                <div className="review-card-header">
                  <div className="review-card-meta">
                    <span className="review-card-member">{review.member?.name || '未知用户'}</span>
                    <span className="review-card-coach">
                      评价教练：{review.coach?.name || '未知'}
                    </span>
                    <span className="review-card-rating">
                      <StarRating rating={review.rating} readonly size="sm" />
                    </span>
                  </div>
                  <div>
                    {getStatusBadge(review.status)}
                    <span className="review-card-date ml-2">
                      {formatDate(review.createdAt, 'YYYY-MM-DD HH:mm')}
                    </span>
                  </div>
                </div>

                {review.courseType && (
                  <div className="mb-2">
                    <span className="course-type-badge">{review.courseType}</span>
                  </div>
                )}

                <div className="review-card-content">{review.content}</div>

                {review.rejectReason && (
                  <div className="mb-3 p-3 bg-red-50 rounded">
                    <p className="text-red-600 text-sm">
                      <strong>拒绝原因：</strong>{review.rejectReason}
                    </p>
                  </div>
                )}

                {review.status === 'pending' && (
                  <div className="review-card-actions">
                    <button
                      className="btn btn-success"
                      onClick={() => handleApprove(review._id)}
                      disabled={processingId === review._id}
                    >
                      {processingId === review._id ? '处理中...' : '通过审核'}
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleRejectClick(review)}
                      disabled={processingId === review._id}
                    >
                      拒绝
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {showRejectModal && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>拒绝评价</h3>
              <button className="modal-close" onClick={() => setShowRejectModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="input-wrapper">
                <label>拒绝原因</label>
                <textarea
                  className="input"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="请填写拒绝原因..."
                  rows={4}
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowRejectModal(false)}
              >
                取消
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleRejectConfirm}
                disabled={processingId === selectedReview?._id}
              >
                {processingId === selectedReview?._id ? '处理中...' : '确认拒绝'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviewModerationPage;
