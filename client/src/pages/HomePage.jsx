import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import WeekCalendar from '../components/WeekCalendar.jsx';
import CourseCard from '../components/CourseCard.jsx';
import { courseAPI, bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext.jsx';
import { formatDate, isSameDay } from '../utils/dateUtils';
import './HomePage.css';

const HomePage = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [weekStart, setWeekStart] = useState(dayjs().startOf('week'));
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [myBookings, setMyBookings] = useState([]);
  const [filterType, setFilterType] = useState('');
  const [filterCoach, setFilterCoach] = useState('');
  const [coaches, setCoaches] = useState([]);
  const [courseTypes, setCourseTypes] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
    if (user) {
      fetchMyBookings();
    }
  }, [weekStart, filterType, filterCoach, user]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseAPI.getList({
        startDate: formatDate(weekStart),
        endDate: formatDate(weekStart.endOf('week')),
        courseType: filterType || undefined,
        coachId: filterCoach || undefined,
      });
      setCourses(response.data);
    } catch (error) {
      console.error('获取课程列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyBookings = async () => {
    try {
      const response = await bookingAPI.getMyBookings({ status: 'booked' });
      setMyBookings(response.data.bookings || []);
    } catch (error) {
      console.error('获取我的预约失败:', error);
    }
  };

  const isBooked = (courseId) => {
    return myBookings.some(b => b.courseSlot?._id === courseId || b.courseSlot === courseId);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handleWeekChange = (newWeekStart) => {
    setWeekStart(newWeekStart);
  };

  const handleBook = async (course) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const response = await bookingAPI.create(course._id);
      alert(response.data.message || '预约成功！');
      fetchCourses();
      fetchMyBookings();
    } catch (error) {
      alert(error.response?.data?.message || '预约失败，请重试');
    }
  };

  const getCoursesForDate = (date) => {
    return courses.filter(c => isSameDay(c.date, date));
  };

  const getCourseCountForDate = (date) => {
    const dayCourses = getCoursesForDate(date);
    return dayCourses.length;
  };

  const selectedDateCourses = getCoursesForDate(selectedDate);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [coachesRes, typesRes] = await Promise.all([
          courseAPI.getList({}).catch(() => ({ data: [] })),
        ]);
        
        const allCourses = Array.isArray(coachesRes.data) ? coachesRes.data : [];
        const types = [...new Set(allCourses.map(c => c.courseType))];
        const coachList = [...new Map(allCourses.map(c => [c.coach?._id, c.coach]).filter(([id]) => id)).values()];
        
        setCourseTypes(types);
        setCoaches(coachList);
      } catch (error) {
        console.error('获取筛选条件失败:', error);
      }
    };
    fetchFilters();
  }, []);

  return (
    <div className="home-page container">
      <div className="page-header">
        <h1>课程预约</h1>
        <p>选择合适的时间，预约您的私教课程</p>
      </div>

      <div className="filter-section">
        <div className="filter-item">
          <label>课程类型</label>
          <select
            className="input"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">全部类型</option>
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

      <WeekCalendar
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        weekStart={weekStart}
        onWeekChange={handleWeekChange}
        renderDayContent={(date) => {
          const count = getCourseCountForDate(date);
          return count > 0 ? `${count}节课` : '';
        }}
      />

      <div className="course-list-section">
        <div className="section-header">
          <h2>
            {formatDate(selectedDate, 'MM月DD日 dddd')} 课程
            <span className="course-count">({selectedDateCourses.length}节)</span>
          </h2>
        </div>

        {loading ? (
          <div className="loading">加载中...</div>
        ) : selectedDateCourses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <p>当天暂无课程安排</p>
            <p className="empty-hint">试试查看其他日期或教练</p>
          </div>
        ) : (
          <div className="course-grid">
            {selectedDateCourses.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                onBook={handleBook}
                isBooked={isBooked(course._id)}
                isLoggedIn={!!user}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
