import React from 'react';
import { formatDate, getStatusText, getStatusBadgeClass } from '../utils/dateUtils';
import './CourseCard.css';

const CourseCard = ({ course, onBook, isBooked, isLoggedIn }) => {
  const { coach, courseType, date, startTime, endTime, status, price, capacity, bookedCount, location } = course;

  const slotsLeft = capacity - bookedCount;
  const isAvailable = status === 'available' && slotsLeft > 0;

  return (
    <div className={`course-card ${status}`}>
      <div className="course-card-header">
        <div className="course-type-badge">
          {courseType}
        </div>
        <span className={`badge ${getStatusBadgeClass(status)}`}>
          {getStatusText(status)}
        </span>
      </div>

      <div className="course-time">
        <div className="time-range">
          <span className="time-text">{startTime}</span>
          <span className="time-divider">—</span>
          <span className="time-text">{endTime}</span>
        </div>
        <div className="course-date">
          {formatDate(date, 'MM月DD日')}
        </div>
      </div>

      <div className="course-coach">
        <div className="coach-avatar-small">
          {coach?.name?.charAt(0) || '教'}
        </div>
        <div className="coach-info">
          <div className="coach-name">{coach?.name || '未知教练'}</div>
          {coach?.rating && (
            <div className="coach-rating">
              <span className="star">★</span>
              <span className="rating-score">{coach.rating}</span>
              <span className="review-count">({coach.reviewCount || 0}条评价)</span>
            </div>
          )}
        </div>
      </div>

      <div className="course-info">
        <div className="info-item">
          <span className="info-label">地点</span>
          <span className="info-value">{location || '私教区'}</span>
        </div>
        <div className="info-item">
          <span className="info-label">剩余名额</span>
          <span className={`info-value ${slotsLeft <= 1 ? 'warning' : ''}`}>
            {slotsLeft} / {capacity}
          </span>
        </div>
      </div>

      <div className="course-footer">
        <div className="course-price">
          <span className="price-label">价格</span>
          <span className="price-value">¥{price}</span>
        </div>

        {isBooked ? (
          <button className="btn btn-secondary" disabled>
            已预约
          </button>
        ) : isAvailable && isLoggedIn ? (
          <button className="btn btn-primary" onClick={() => onBook?.(course)}>
            立即预约
          </button>
        ) : !isLoggedIn ? (
          <button className="btn btn-primary" onClick={() => onBook?.(course)}>
            登录预约
          </button>
        ) : (
          <button className="btn btn-secondary" disabled>
            {status === 'full' ? '已满员' : '不可预约'}
          </button>
        )}
      </div>
    </div>
  );
};

export default CourseCard;
