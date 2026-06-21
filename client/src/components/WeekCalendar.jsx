import React, { useState, useRef, useEffect } from 'react';
import dayjs from 'dayjs';
import { getWeekDays, isToday, isPast, formatDate, getShortDayName } from '../utils/dateUtils';
import './WeekCalendar.css';

const WeekCalendar = ({
  selectedDate,
  onDateSelect,
  weekStart,
  onWeekChange,
  renderDayContent,
  showHeader = true,
  className = '',
}) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(
    weekStart || dayjs(selectedDate || dayjs()).startOf('week')
  );
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const containerRef = useRef(null);

  const minSwipeDistance = 50;

  useEffect(() => {
    if (weekStart) {
      setCurrentWeekStart(dayjs(weekStart));
    }
  }, [weekStart]);

  const weekDays = getWeekDays(currentWeekStart);

  const goToPrevWeek = () => {
    const prevWeek = currentWeekStart.subtract(1, 'week');
    setCurrentWeekStart(prevWeek);
    onWeekChange?.(prevWeek);
  };

  const goToNextWeek = () => {
    const nextWeek = currentWeekStart.add(1, 'week');
    setCurrentWeekStart(nextWeek);
    onWeekChange?.(nextWeek);
  };

  const goToToday = () => {
    const today = dayjs();
    setCurrentWeekStart(today.startOf('week'));
    onWeekChange?.(today.startOf('week'));
    onDateSelect?.(today);
  };

  const handleDateClick = (date) => {
    onDateSelect?.(date);
  };

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(e.targetTouches[0].clientX);
    setIsSwiping(true);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
    const diff = e.targetTouches[0].clientX - touchStart;
    const maxOffset = containerRef.current?.offsetWidth || 0;
    const offset = Math.max(-maxOffset, Math.min(maxOffset, diff));
    setSwipeOffset(offset);
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNextWeek();
    } else if (isRightSwipe) {
      goToPrevWeek();
    }

    setTouchStart(null);
    setTouchEnd(null);
    setSwipeOffset(0);
  };

  const handleMouseDown = (e) => {
    setTouchStart(e.clientX);
    setTouchEnd(e.clientX);
    setIsSwiping(true);
  };

  const handleMouseMove = (e) => {
    if (!isSwiping) return;
    setTouchEnd(e.clientX);
    const diff = e.clientX - touchStart;
    const maxOffset = containerRef.current?.offsetWidth || 0;
    const offset = Math.max(-maxOffset, Math.min(maxOffset, diff));
    setSwipeOffset(offset);
  };

  const handleMouseUp = () => {
    if (!isSwiping) return;
    setIsSwiping(false);
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNextWeek();
    } else if (isRightSwipe) {
      goToPrevWeek();
    }

    setTouchStart(null);
    setTouchEnd(null);
    setSwipeOffset(0);
  };

  const handleMouseLeave = () => {
    if (isSwiping) {
      handleMouseUp();
    }
  };

  const weekStartStr = formatDate(currentWeekStart);
  const weekEndStr = formatDate(currentWeekStart.endOf('week'));

  return (
    <div className={`week-calendar ${className}`}>
      {showHeader && (
        <div className="week-calendar-header">
          <button className="week-nav-btn" onClick={goToPrevWeek}>
            ‹
          </button>
          <div className="week-title">
            <span className="week-title-text">
              {weekStartStr} ~ {weekEndStr}
            </span>
            <button className="today-btn" onClick={goToToday}>
              今天
            </button>
          </div>
          <button className="week-nav-btn" onClick={goToNextWeek}>
            ›
          </button>
        </div>
      )}

      <div
        ref={containerRef}
        className="week-calendar-body"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{
          cursor: isSwiping ? 'grabbing' : 'grab',
          transform: isSwiping ? `translateX(${swipeOffset}px)` : 'none',
          transition: isSwiping ? 'none' : 'transform 0.3s ease',
        }}
      >
        <div className="week-day-names">
          {weekDays.map((day, index) => (
            <div key={index} className="week-day-name">
              {getShortDayName(day)}
            </div>
          ))}
        </div>

        <div className="week-days">
          {weekDays.map((day, index) => {
            const dateStr = formatDate(day);
            const isSelected = selectedDate && dayjs(selectedDate).isSame(day, 'day');
            const isTodayDate = isToday(day);
            const isPastDate = isPast(day);

            return (
              <div
                key={index}
                className={`week-day ${isSelected ? 'selected' : ''} ${isTodayDate ? 'today' : ''} ${isPastDate ? 'past' : ''}`}
                onClick={() => handleDateClick(day)}
              >
                <div className="day-number">
                  {day.date()}
                  {isTodayDate && <span className="today-dot"></span>}
                </div>
                {renderDayContent && (
                  <div className="day-content">
                    {renderDayContent(day)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="week-calendar-hint">
        <span>← 左右滑动切换周 →</span>
      </div>
    </div>
  );
};

export default WeekCalendar;
