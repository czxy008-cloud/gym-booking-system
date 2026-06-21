import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseAPI, coachAPI } from '../services/api';
import { formatDate, getStatusText, getStatusBadgeClass } from '../utils/dateUtils';
import { useAuth } from '../context/AuthContext.jsx';
import './AdminPages.css';

const AdminCourseManagementPage = () => {
  const [courses, setCourses] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    coach: '',
    courseType: '',
    date: '',
    startTime: '',
    endTime: '',
    capacity: 1,
    price: 200,
    description: '',
    location: '私教区',
  });
  const [batchFormData, setBatchFormData] = useState({
    coach: '',
    courseType: '',
    startDate: '',
    endDate: '',
    daysOfWeek: [],
    startTime: '',
    endTime: '',
    capacity: 1,
    price: 200,
    description: '',
    location: '私教区',
  });
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const courseTypes = ['瑜伽', '增肌', '减脂', '塑形', '康复', '搏击', '普拉提', '有氧'];
  const weekDays = [
    { value: 1, label: '周一' },
    { value: 2, label: '周二' },
    { value: 3, label: '周三' },
    { value: 4, label: '周四' },
    { value: 5, label: '周五' },
    { value: 6, label: '周六' },
    { value: 0, label: '周日' },
  ];

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchCourses();
    fetchCoaches();
  }, [user]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
      const response = await courseAPI.getList({
        startDate: formatDate(today),
        endDate: formatDate(nextMonth),
      });
      setCourses(response.data || []);
    } catch (error) {
      console.error('获取课程列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoaches = async () => {
    try {
      const response = await coachAPI.getAll({ limit: 20 });
      setCoaches(response.data.coaches || []);
    } catch (error) {
      console.error('获取教练列表失败:', error);
    }
  };

  const handleAdd = () => {
    setEditingCourse(null);
    setFormData({
      coach: coaches[0]?._id || '',
      courseType: '',
      date: '',
      startTime: '09:00',
      endTime: '10:00',
      capacity: 1,
      price: 200,
      description: '',
      location: '私教区',
    });
    setShowModal(true);
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      coach: course.coach?._id || course.coach,
      courseType: course.courseType,
      date: formatDate(course.date),
      startTime: course.startTime,
      endTime: course.endTime,
      capacity: course.capacity,
      price: course.price,
      description: course.description || '',
      location: course.location || '私教区',
    });
    setShowModal(true);
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('确定要删除此课程吗？如果已有会员预约则无法删除。')) {
      return;
    }
    try {
      await courseAPI.delete(courseId);
      alert('删除成功');
      fetchCourses();
    } catch (error) {
      alert(error.response?.data?.message || '删除失败');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingCourse) {
        await courseAPI.update(editingCourse._id, formData);
        alert('更新成功');
      } else {
        await courseAPI.create(formData);
        alert('创建成功');
      }
      setShowModal(false);
      fetchCourses();
    } catch (error) {
      alert(error.response?.data?.message || '保存失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBatchSubmit = async (e) => {
    e.preventDefault();
    if (batchFormData.daysOfWeek.length === 0) {
      alert('请选择至少一天');
      return;
    }
    try {
      setSubmitting(true);
      const response = await courseAPI.createBatch(batchFormData);
      alert(`成功创建 ${response.data.created} 个课程，${response.data.conflicts} 个时段冲突`);
      setShowBatchModal(false);
      fetchCourses();
    } catch (error) {
      alert(error.response?.data?.message || '批量创建失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDayToggle = (dayValue) => {
    setBatchFormData((prev) => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(dayValue)
        ? prev.daysOfWeek.filter((d) => d !== dayValue)
        : [...prev.daysOfWeek, dayValue],
    }));
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="admin-page container">
      <div className="admin-header">
        <div>
          <h1>课程排期管理</h1>
          <p>管理课程时段和排期安排</p>
        </div>
        <div className="admin-actions">
          <button className="btn btn-secondary" onClick={() => setShowBatchModal(true)}>
            批量创建
          </button>
          <button className="btn btn-primary" onClick={handleAdd}>
            添加课程
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">加载中...</div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>日期</th>
                <th>时间</th>
                <th>课程类型</th>
                <th>教练</th>
                <th>价格</th>
                <th>名额</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course._id}>
                  <td>{formatDate(course.date, 'MM-DD')}</td>
                  <td>
                    {course.startTime} - {course.endTime}
                  </td>
                  <td>
                    <span className="course-type-badge">{course.courseType}</span>
                  </td>
                  <td>{course.coach?.name || '未知'}</td>
                  <td>¥{course.price}</td>
                  <td>
                    {course.bookedCount}/{course.capacity}
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(course.status)}`}>
                      {getStatusText(course.status)}
                    </span>
                  </td>
                  <td>
                    <button
                      className="action-btn edit"
                      onClick={() => handleEdit(course)}
                    >
                      编辑
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDelete(course._id)}
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {courses.length === 0 && (
            <div className="empty-state">
              <p>暂无课程安排</p>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCourse ? '编辑课程' : '添加课程'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="input-wrapper">
                    <label>教练</label>
                    <select
                      className="input"
                      value={formData.coach}
                      onChange={(e) => setFormData({ ...formData, coach: e.target.value })}
                      required
                    >
                      <option value="">请选择教练</option>
                      {coaches.map((coach) => (
                        <option key={coach._id} value={coach._id}>
                          {coach.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="input-wrapper">
                    <label>课程类型</label>
                    <select
                      className="input"
                      value={formData.courseType}
                      onChange={(e) => setFormData({ ...formData, courseType: e.target.value })}
                      required
                    >
                      <option value="">请选择课程类型</option>
                      {courseTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="input-wrapper">
                    <label>日期</label>
                    <input
                      type="date"
                      className="input"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="input-wrapper">
                    <label>开始时间</label>
                    <input
                      type="time"
                      className="input"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      required
                    />
                  </div>
                  <div className="input-wrapper">
                    <label>结束时间</label>
                    <input
                      type="time"
                      className="input"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      required
                    />
                  </div>
                  <div className="input-wrapper">
                    <label>名额</label>
                    <input
                      type="number"
                      className="input"
                      min="1"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="input-wrapper">
                    <label>价格</label>
                    <input
                      type="number"
                      className="input"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="input-wrapper">
                    <label>地点</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                </div>
                <div className="input-wrapper mt-3">
                  <label>课程描述</label>
                  <textarea
                    className="input"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  取消
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showBatchModal && (
        <div className="modal-overlay" onClick={() => setShowBatchModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>批量创建课程</h3>
              <button className="modal-close" onClick={() => setShowBatchModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleBatchSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="input-wrapper">
                    <label>教练</label>
                    <select
                      className="input"
                      value={batchFormData.coach}
                      onChange={(e) => setBatchFormData({ ...batchFormData, coach: e.target.value })}
                      required
                    >
                      <option value="">请选择教练</option>
                      {coaches.map((coach) => (
                        <option key={coach._id} value={coach._id}>
                          {coach.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="input-wrapper">
                    <label>课程类型</label>
                    <select
                      className="input"
                      value={batchFormData.courseType}
                      onChange={(e) => setBatchFormData({ ...batchFormData, courseType: e.target.value })}
                      required
                    >
                      <option value="">请选择课程类型</option>
                      {courseTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="input-wrapper">
                    <label>开始日期</label>
                    <input
                      type="date"
                      className="input"
                      value={batchFormData.startDate}
                      onChange={(e) => setBatchFormData({ ...batchFormData, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="input-wrapper">
                    <label>结束日期</label>
                    <input
                      type="date"
                      className="input"
                      value={batchFormData.endDate}
                      onChange={(e) => setBatchFormData({ ...batchFormData, endDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="input-wrapper">
                    <label>开始时间</label>
                    <input
                      type="time"
                      className="input"
                      value={batchFormData.startTime}
                      onChange={(e) => setBatchFormData({ ...batchFormData, startTime: e.target.value })}
                      required
                    />
                  </div>
                  <div className="input-wrapper">
                    <label>结束时间</label>
                    <input
                      type="time"
                      className="input"
                      value={batchFormData.endTime}
                      onChange={(e) => setBatchFormData({ ...batchFormData, endTime: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="input-wrapper mt-3">
                  <label>每周重复</label>
                  <div className="week-day-selector">
                    {weekDays.map((day) => (
                      <label key={day.value} className="week-day-checkbox">
                        <input
                          type="checkbox"
                          checked={batchFormData.daysOfWeek.includes(day.value)}
                          onChange={() => handleDayToggle(day.value)}
                        />
                        <span>{day.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-grid mt-3">
                  <div className="input-wrapper">
                    <label>名额</label>
                    <input
                      type="number"
                      className="input"
                      min="1"
                      value={batchFormData.capacity}
                      onChange={(e) => setBatchFormData({ ...batchFormData, capacity: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="input-wrapper">
                    <label>价格</label>
                    <input
                      type="number"
                      className="input"
                      min="0"
                      value={batchFormData.price}
                      onChange={(e) => setBatchFormData({ ...batchFormData, price: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowBatchModal(false)}>
                  取消
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? '创建中...' : '批量创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourseManagementPage;
