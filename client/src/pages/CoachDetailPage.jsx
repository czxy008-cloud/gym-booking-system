import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StarRating from '../components/StarRating.jsx';
import { coachAPI, reviewAPI, courseAPI, bookingAPI } from '../services/api';
import { formatDate } from '../utils/dateUtils';
import { useAuth } from '../context/AuthContext.jsx';
import './CoachDetailPage.css';

const CoachDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [coach, setCoach] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(null);
  const [reviewPage, setReviewPage] = useState(1);
  const [ratingDistribution, setRatingDistribution] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  const { user } = useAuth();

  useEffect(() => {
    fetchCoachDetail();
    fetchReviews();
    fetchCourses();
  }, [id, reviewPage]);

  const fetchCoachDetail = async () => {
    try {
      const response = await coachAPI.getById(id);
      setCoach(response.data);
    } catch (error) {
      console.error('获取教练详情失败:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await reviewAPI.getCoachReviews(id, {
        page: reviewPage,
        limit: 10,
      });
      setReviews(response.data.reviews || []);
      setRatingDistribution(response.data.ratingDistribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
    } catch (error) {
      console.error('获取教练评价失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const response = await courseAPI.getList({
        coachId: id,
        startDate: formatDate(today),
        endDate: formatDate(nextWeek),
      });
      setCourses(Array.isArray(response.data) ? response.data.slice(0, 5) : []);
    } catch (error) {
      console.error('获取教练课程失败:', error);
    }
  };

  const handleBookCourse = async (course) => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      setBookingLoading(course._id);
      const response = await bookingAPI.create(course._id);
      alert(`预约成功！剩余课时：${response.data.remainingSessions}`);
      fetchCourses();
    } catch (error) {
      alert(error.response?.data?.message || '预约失败');
    } finally {
      setBookingLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="coach-detail-page container">
        <div className="loading">加载中...</div>
      </div>
    );
  }

  if (!coach) {
    return (
      <div className="coach-detail-page container">
        <div className="empty-state">
          <p>教练不存在</p>
        </div>
      </div>
    );
  }

  const totalReviews = Object.values(ratingDistribution).reduce((a, b) => a + b, 0);

  return (
    <div className="coach-detail-page container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← 返回
      </button>

      <div className="coach-profile-card">
        <div className="coach-profile-header">
          <div className="coach-avatar-xl">
            {coach.name?.charAt(0) || '教'}
          </div>
          <div className="coach-profile-info">
            <h1 className="coach-name">{coach.name}</h1>
            <div className="coach-rating-row">
              <StarRating rating={coach.rating} readonly size="md" />
              <span className="rating-score">{coach.rating}</span>
              <span className="review-count">({coach.reviewCount}条评价)</span>
            </div>
            <div className="coach-specialties">
              {coach.specialties?.map((spec, i) => (
                <span key={i} className="specialty-tag">
                  {spec}
                </span>
              ))}
            </div>
            <div className="coach-meta">
              <span>从业 {coach.experienceYears} 年</span>
            </div>
          </div>
        </div>

        <div className="coach-bio-section">
          <h3>教练简介</h3>
          <p>{coach.bio || '暂无简介'}</p>
        </div>
      </div>

      <div className="section-card">
        <div className="section-header">
          <h2>近期课程</h2>
          <button className="view-all-btn" onClick={() => navigate('/')}>
            查看全部 →
          </button>
        </div>

        {courses.length === 0 ? (
          <div className="empty-state small">
            <p>近期暂无课程</p>
          </div>
        ) : (
          <div className="course-list-simple">
            {courses.map((course) => (
              <div key={course._id} className="course-item-simple">
                <div className="course-date-time">
                  <div className="course-date">
                    {formatDate(course.date, 'MM月DD日')}
                  </div>
                  <div className="course-time">
                    {course.startTime} - {course.endTime}
                  </div>
                </div>
                <div className="course-type-tag">{course.courseType}</div>
                <div className="course-price">¥{course.price}</div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleBookCourse(course)}
                  disabled={course.status !== 'available' || bookingLoading === course._id}
                >
                  {bookingLoading === course._id
                    ? '预约中...'
                    : course.status === 'available'
                    ? '预约'
                    : '已满'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="section-card">
        <div className="section-header">
          <h2>学员评价</h2>
          <span className="review-total">共 {totalReviews} 条</span>
        </div>

        <div className="rating-overview">
          <div className="rating-score-large">
            <span className="score">{coach.rating}</span>
            <StarRating rating={coach.rating} readonly size="sm" />
          </div>
          <div className="rating-bars">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingDistribution[star] || 0;
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <div key={star} className="rating-bar-row">
                  <span className="star-label">{star}星</span>
                  <div className="rating-bar-bg">
                    <div
                      className="rating-bar-fill"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="star-count">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="empty-state small">
            <p>暂无评价</p>
          </div>
        ) : (
          <div className="reviews-list">
            {reviews.map((review) => (
              <div key={review._id} className="review-item">
                <div className="reviewer-info">
                  <div className="reviewer-avatar">
                    {review.member?.name?.charAt(0) || '会'}
                  </div>
                  <div className="reviewer-detail">
                    <div className="reviewer-name">{review.member?.name || '会员'}</div>
                    <div className="review-time">
                      {formatDate(review.createdAt, 'YYYY-MM-DD')}
                    </div>
                  </div>
                  <StarRating rating={review.rating} readonly size="sm" />
                </div>
                {review.content && (
                  <p className="review-text">{review.content}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoachDetailPage;
