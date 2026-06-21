const dayjs = require('dayjs');
const CourseSlot = require('../models/CourseSlot');
const Coach = require('../models/Coach');
const Booking = require('../models/Booking');

const checkTimeConflict = async (coachId, date, startTime, endTime, excludeId = null) => {
  const query = {
    coach: coachId,
    date: new Date(date),
    status: { $ne: 'cancelled' },
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const existingSlots = await CourseSlot.find(query);

  const newStart = timeToMinutes(startTime);
  const newEnd = timeToMinutes(endTime);

  for (const slot of existingSlots) {
    const slotStart = timeToMinutes(slot.startTime);
    const slotEnd = timeToMinutes(slot.endTime);

    if (newStart < slotEnd && newEnd > slotStart) {
      return true;
    }
  }

  return false;
};

const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const getCourseSlots = async (req, res) => {
  try {
    const { date, startDate, endDate, coachId, courseType, status } = req.query;
    const query = {};

    if (date) {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query.date = { $gte: targetDate, $lt: nextDay };
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }

    if (coachId) {
      query.coach = coachId;
    }

    if (courseType) {
      query.courseType = courseType;
    }

    if (status) {
      query.status = status;
    }

    const slots = await CourseSlot.find(query)
      .populate('coach', 'name avatar specialties rating')
      .sort({ date: 1, startTime: 1 });

    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: '获取课程列表失败', error: error.message });
  }
};

const getCourseSlotById = async (req, res) => {
  try {
    const slot = await CourseSlot.findById(req.params.id)
      .populate('coach', 'name avatar specialties rating bio');

    if (!slot) {
      return res.status(404).json({ message: '课程不存在' });
    }

    res.json(slot);
  } catch (error) {
    res.status(500).json({ message: '获取课程详情失败', error: error.message });
  }
};

const createCourseSlot = async (req, res) => {
  try {
    const { coach, courseType, date, startTime, endTime, capacity, price, description, location } = req.body;

    const coachDoc = await Coach.findById(coach);
    if (!coachDoc) {
      return res.status(404).json({ message: '教练不存在' });
    }

    if (coachDoc.status !== 'active') {
      return res.status(400).json({ message: '该教练已停用' });
    }

    if (!coachDoc.specialties.includes(courseType)) {
      return res.status(400).json({ message: '该教练不擅长此课程类型' });
    }

    const hasConflict = await checkTimeConflict(coach, date, startTime, endTime);
    if (hasConflict) {
      return res.status(400).json({ message: '该时间段存在时间冲突' });
    }

    const slot = await CourseSlot.create({
      coach,
      courseType,
      date,
      startTime,
      endTime,
      capacity: capacity || 1,
      price: price || 200,
      description,
      location,
    });

    const populatedSlot = await CourseSlot.findById(slot._id)
      .populate('coach', 'name avatar specialties');

    res.status(201).json(populatedSlot);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: '该时段已存在' });
    }
    res.status(500).json({ message: '创建课程失败', error: error.message });
  }
};

const createBatchCourseSlots = async (req, res) => {
  try {
    const { coach, courseType, startDate, endDate, daysOfWeek, startTime, endTime, capacity, price, description, location } = req.body;

    const coachDoc = await Coach.findById(coach);
    if (!coachDoc) {
      return res.status(404).json({ message: '教练不存在' });
    }

    if (!coachDoc.specialties.includes(courseType)) {
      return res.status(400).json({ message: '该教练不擅长此课程类型' });
    }

    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const slots = [];
    const conflicts = [];

    let current = start;
    while (current.isBefore(end) || current.isSame(end, 'day')) {
      const dayOfWeek = current.day();
      
      if (daysOfWeek.includes(dayOfWeek)) {
        const dateStr = current.format('YYYY-MM-DD');
        const hasConflict = await checkTimeConflict(coach, dateStr, startTime, endTime);

        if (hasConflict) {
          conflicts.push(dateStr);
        } else {
          slots.push({
            coach,
            courseType,
            date: current.toDate(),
            startTime,
            endTime,
            capacity: capacity || 1,
            price: price || 200,
            description,
            location,
          });
        }
      }

      current = current.add(1, 'day');
    }

    const createdSlots = await CourseSlot.insertMany(slots);

    res.status(201).json({
      created: createdSlots.length,
      conflicts: conflicts.length,
      conflictDates: conflicts,
      slots: createdSlots,
    });
  } catch (error) {
    res.status(500).json({ message: '批量创建课程失败', error: error.message });
  }
};

const updateCourseSlot = async (req, res) => {
  try {
    const slot = await CourseSlot.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ message: '课程不存在' });
    }

    if (slot.bookedCount > 0 && (req.body.date || req.body.startTime || req.body.endTime)) {
      return res.status(400).json({ message: '已有会员预约，无法修改时间' });
    }

    const { coach, date, startTime, endTime } = req.body;
    if (date || startTime || endTime || coach) {
      const hasConflict = await checkTimeConflict(
        coach || slot.coach,
        date || slot.date,
        startTime || slot.startTime,
        endTime || slot.endTime,
        slot._id
      );
      if (hasConflict) {
        return res.status(400).json({ message: '该时间段存在时间冲突' });
      }
    }

    const updatedSlot = await CourseSlot.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('coach', 'name avatar specialties');

    res.json(updatedSlot);
  } catch (error) {
    res.status(500).json({ message: '更新课程失败', error: error.message });
  }
};

const deleteCourseSlot = async (req, res) => {
  try {
    const slot = await CourseSlot.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ message: '课程不存在' });
    }

    if (slot.bookedCount > 0) {
      return res.status(400).json({ message: '已有会员预约，无法删除' });
    }

    slot.status = 'cancelled';
    await slot.save();

    res.json({ message: '课程已取消' });
  } catch (error) {
    res.status(500).json({ message: '删除课程失败', error: error.message });
  }
};

const getWeeklySchedule = async (req, res) => {
  try {
    const { weekStart, coachId, courseType } = req.query;
    const start = dayjs(weekStart).startOf('week');
    const end = start.endOf('week');

    const query = {
      date: { $gte: start.toDate(), $lte: end.toDate() },
      status: { $ne: 'cancelled' },
    };

    if (coachId) {
      query.coach = coachId;
    }

    if (courseType) {
      query.courseType = courseType;
    }

    const slots = await CourseSlot.find(query)
      .populate('coach', 'name avatar specialties rating')
      .sort({ date: 1, startTime: 1 });

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = start.add(i, 'day');
      const dayStr = day.format('YYYY-MM-DD');
      const daySlots = slots.filter(s => 
        dayjs(s.date).format('YYYY-MM-DD') === dayStr
      );
      weekDays.push({
        date: dayStr,
        dayOfWeek: day.day(),
        slots: daySlots,
      });
    }

    res.json({
      weekStart: start.format('YYYY-MM-DD'),
      weekEnd: end.format('YYYY-MM-DD'),
      days: weekDays,
    });
  } catch (error) {
    res.status(500).json({ message: '获取周课表失败', error: error.message });
  }
};

module.exports = {
  getCourseSlots,
  getCourseSlotById,
  createCourseSlot,
  createBatchCourseSlots,
  updateCourseSlot,
  deleteCourseSlot,
  getWeeklySchedule,
  checkTimeConflict,
};
