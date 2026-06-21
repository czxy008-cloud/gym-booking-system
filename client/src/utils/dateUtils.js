import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData';
import 'dayjs/locale/zh-cn';

dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.locale('zh-cn');

export const formatDate = (date, format = 'YYYY-MM-DD') => {
  return dayjs(date).format(format);
};

export const formatDateTime = (date, format = 'YYYY-MM-DD HH:mm') => {
  return dayjs(date).format(format);
};

export const getWeekStart = (date = dayjs()) => {
  return dayjs(date).startOf('week');
};

export const getWeekEnd = (date = dayjs()) => {
  return dayjs(date).endOf('week');
};

export const getWeekDays = (weekStart) => {
  const days = [];
  const start = dayjs(weekStart).startOf('week');
  for (let i = 0; i < 7; i++) {
    days.push(start.add(i, 'day'));
  }
  return days;
};

export const isSameDay = (date1, date2) => {
  return dayjs(date1).isSame(dayjs(date2), 'day');
};

export const isToday = (date) => {
  return dayjs(date).isSame(dayjs(), 'day');
};

export const isPast = (date) => {
  return dayjs(date).isBefore(dayjs(), 'day');
};

export const isFuture = (date) => {
  return dayjs(date).isAfter(dayjs(), 'day');
};

export const getDayName = (date) => {
  return dayjs(date).format('dddd');
};

export const getShortDayName = (date) => {
  return dayjs(date).format('ddd');
};

export const formatTime = (time) => {
  return time;
};

export const getStatusText = (status) => {
  const statusMap = {
    available: '可预约',
    full: '已满员',
    cancelled: '已取消',
    completed: '已完成',
    booked: '已预约',
    no_show: '未到课',
    refunded: '已退款',
    pending: '待审核',
    approved: '已通过',
    rejected: '已驳回',
    active: '正常',
    inactive: '停用',
    frozen: '冻结',
  };
  return statusMap[status] || status;
};

export const getStatusBadgeClass = (status) => {
  const classMap = {
    available: 'badge-success',
    full: 'badge-warning',
    cancelled: 'badge-gray',
    completed: 'badge-primary',
    booked: 'badge-success',
    no_show: 'badge-danger',
    refunded: 'badge-gray',
    pending: 'badge-warning',
    approved: 'badge-success',
    rejected: 'badge-danger',
    active: 'badge-success',
    inactive: 'badge-gray',
    frozen: 'badge-warning',
  };
  return classMap[status] || 'badge-gray';
};

export const renderStars = (rating) => {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
  
  return '★'.repeat(fullStars) + (hasHalf ? '☆' : '') + '☆'.repeat(emptyStars);
};

export default dayjs;
