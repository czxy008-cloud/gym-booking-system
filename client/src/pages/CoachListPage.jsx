import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StarRating from '../components/StarRating.jsx';
import { coachAPI } from '../services/api';
import './CoachListPage.css';

const CoachListPage = () => {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [specialty, setSpecialty] = useState('');
  const [specialties, setSpecialties] = useState([]);

  useEffect(() => {
    fetchCoaches();
    fetchSpecialties();
  }, [specialty]);

  const fetchCoaches = async () => {
    try {
      setLoading(true);
      const response = await coachAPI.getAll({
        specialty: specialty || undefined,
        limit: 20,
      });
      setCoaches(response.data.coaches || []);
    } catch (error) {
      console.error('获取教练列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecialties = async () => {
    try {
      const response = await coachAPI.getSpecialties();
      setSpecialties(response.data || []);
    } catch (error) {
      console.error('获取课程类型失败:', error);
    }
  };

  return (
    <div className="coach-list-page container">
      <div className="page-header">
        <h1>教练团队</h1>
        <p>选择适合您的专业教练</p>
      </div>

      <div className="filter-section">
        <div className="filter-item">
          <label>擅长项目</label>
          <select
            className="input"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
          >
            <option value="">全部</option>
            <option value="瑜伽">瑜伽</option>
            <option value="增肌">增肌</option>
            <option value="减脂">减脂</option>
            <option value="塑形">塑形</option>
            <option value="康复">康复</option>
            <option value="搏击">搏击</option>
            <option value="普拉提">普拉提</option>
            <option value="有氧">有氧</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">加载中...</div>
      ) : (
        <div className="coach-grid">
          {coaches.map((coach) => (
            <Link
              key={coach._id}
              to={`/coaches/${coach._id}`}
              className="coach-card"
            >
              <div className="coach-avatar-large">
                {coach.name?.charAt(0) || '教'}
              </div>
              <div className="coach-info-main">
                <h3 className="coach-name">{coach.name}</h3>
                <div className="coach-rating-row">
                  <StarRating rating={coach.rating} readonly size="sm" />
                  <span className="rating-text">{coach.rating}</span>
                  <span className="review-count">({coach.reviewCount}条评价)</span>
                </div>
                <div className="coach-specialties">
                  {coach.specialties?.map((spec, i) => (
                    <span key={i} className="specialty-tag">
                      {spec}
                    </span>
                  ))}
                </div>
                <p className="coach-bio">{coach.bio}</p>
                <div className="coach-experience">
                  <span>从业 {coach.experienceYears} 年</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoachListPage;
