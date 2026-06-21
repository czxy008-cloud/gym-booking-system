const dayjs = require('dayjs');
const Booking = require('../models/Booking');
const CourseSlot = require('../models/CourseSlot');
const Member = require('../models/Member');
const Review = require('../models/Review');

const CANCELLATION_FREE_HOURS = 24;

const canCancelFree = (courseDate, startTime) => {
  const courseDateTime = dayjs(`${dayjs(courseDate).format('YYYY-MM-DD')} ${startTime}`);
  const now = dayjs();
  const diffHours = courseDateTime.diff(now, 'hour');
  return diffHours >= CANCELLATION_FREE_HOURS;
};

const getMyBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { member: req.member._id };

    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('courseSlot')
      .populate('coach', 'name avatar specialties')
      .populate('review')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Booking.countDocuments(query);

    const bookingsWithCancelInfo = bookings.map(booking => {
      const canCancel = booking.status === 'booked';
      const canCancelFreeOfCharge = canCancel && canCancelFree(booking.courseSlot.date, booking.courseSlot.startTime);
      
      return {
        ...booking.toObject(),
        canCancel,
        canCancelFreeOfCharge,
        cancellationDeadline: dayjs(`${dayjs(booking.courseSlot.date).format('YYYY-MM-DD')} ${booking.courseSlot.startTime}`)
          .subtract(CANCELLATION_FREE_HOURS, 'hour')
          .format('YYYY-MM-DD HH:mm'),
      };
    });

    res.json({
      bookings: bookingsWithCancelInfo,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: '获取预约列表失败', error: error.message });
  }
};

const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('courseSlot')
      .populate('coach', 'name avatar specialties rating')
      .populate('member', 'name phone')
      .populate('review');

    if (!booking) {
      return res.status(404).json({ message: '预约不存在' });
    }

    if (booking.member._id.toString() !== req.member._id.toString()) {
      return res.status(403).json({ message: '无权查看此预约' });
    }

    const canCancel = booking.status === 'booked';
    const canCancelFreeOfCharge = canCancel && canCancelFree(booking.courseSlot.date, booking.courseSlot.startTime);

    res.json({
      ...booking.toObject(),
      canCancel,
      canCancelFreeOfCharge,
      cancellationDeadline: dayjs(`${dayjs(booking.courseSlot.date).format('YYYY-MM-DD')} ${booking.courseSlot.startTime}`)
        .subtract(CANCELLATION_FREE_HOURS, 'hour')
        .format('YYYY-MM-DD HH:mm'),
    });
  } catch (error) {
    res.status(500).json({ message: '获取预约详情失败', error: error.message });
  }
};

const createBooking = async (req, res) => {
  try {
    const { courseSlotId } = req.body;

    const slot = await CourseSlot.findById(courseSlotId);
    if (!slot) {
      return res.status(404).json({ message: '课程不存在' });
    }

    if (slot.status === 'cancelled') {
      return res.status(400).json({ message: '该课程已取消' });
    }

    if (slot.isFull()) {
      return res.status(400).json({ message: '该课程已约满' });
    }

    const member = await Member.findById(req.member._id);
    if (!member) {
      return res.status(404).json({ message: '会员不存在' });
    }

    if (member.status !== 'active') {
      return res.status(400).json({ message: '会员状态异常，无法预约' });
    }

    if (member.remainingSessions <= 0) {
      return res.status(400).json({ message: '课时不足，请先购买课时' });
    }

    const existingBooking = await Booking.findOne({
      member: req.member._id,
      courseSlot: courseSlotId,
      status: { $in: ['booked', 'completed'] },
    });

    if (existingBooking) {
      return res.status(400).json({ message: '您已预约该课程' });
    }

    const courseDateTime = dayjs(`${dayjs(slot.date).format('YYYY-MM-DD')} ${slot.startTime}`);
    if (courseDateTime.isBefore(dayjs())) {
      return res.status(400).json({ message: '该课程已过期' });
    }

    const booking = await Booking.create({
      member: req.member._id,
      courseSlot: courseSlotId,
      coach: slot.coach,
      price: slot.price,
    });

    slot.bookedCount += 1;
    if (slot.bookedCount >= slot.capacity) {
      slot.status = 'full';
    }
    await slot.save();

    member.remainingSessions -= 1;
    await member.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('courseSlot')
      .populate('coach', 'name avatar');

    res.status(201).json({
      message: '预约成功',
      booking: populatedBooking,
      remainingSessions: member.remainingSessions,
    });
  } catch (error) {
    res.status(500).json({ message: '预约失败', error: error.message });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(id)
      .populate('courseSlot');

    if (!booking) {
      return res.status(404).json({ message: '预约不存在' });
    }

    if (booking.member.toString() !== req.member._id.toString()) {
      return res.status(403).json({ message: '无权取消此预约' });
    }

    if (booking.status !== 'booked') {
      return res.status(400).json({ message: '该预约无法取消' });
    }

    const isFreeCancellation = canCancelFree(booking.courseSlot.date, booking.courseSlot.startTime);

    booking.status = 'cancelled';
    booking.cancelTime = new Date();
    booking.cancelReason = reason || '';
    booking.refunded = isFreeCancellation;

    const member = await Member.findById(req.member._id);
    if (isFreeCancellation) {
      member.remainingSessions += 1;
    }
    await member.save();

    const slot = await CourseSlot.findById(booking.courseSlot._id);
    slot.bookedCount = Math.max(0, slot.bookedCount - 1);
    if (slot.bookedCount < slot.capacity && slot.status === 'full') {
      slot.status = 'available';
    }
    await slot.save();

    await booking.save();

    res.json({
      message: isFreeCancellation ? '取消成功，课时已退回' : '取消成功，因距开课不足24小时，课时不予退还',
      isFreeCancellation,
      remainingSessions: member.remainingSessions,
    });
  } catch (error) {
    res.status(500).json({ message: '取消失败', error: error.message });
  }
};

const checkInBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate('courseSlot');

    if (!booking) {
      return res.status(404).json({ message: '预约不存在' });
    }

    if (booking.member.toString() !== req.member._id.toString()) {
      return res.status(403).json({ message: '无权操作此预约' });
    }

    if (booking.status !== 'booked') {
      return res.status(400).json({ message: '该预约无法签到' });
    }

    if (booking.checkedIn) {
      return res.status(400).json({ message: '已签到，无需重复签到' });
    }

    booking.checkedIn = true;
    booking.checkInTime = new Date();
    booking.status = 'completed';
    await booking.save();

    const member = await Member.findById(req.member._id);
    member.checkIns.push({
      date: new Date(),
      type: 'course',
    });
    await member.save();

    const slot = await CourseSlot.findById(booking.courseSlot._id);
    if (slot.status !== 'completed') {
      slot.status = 'completed';
      await slot.save();
    }

    res.json({
      message: '签到成功',
      checkInTime: booking.checkInTime,
      canReview: true,
    });
  } catch (error) {
    res.status(500).json({ message: '签到失败', error: error.message });
  }
};

const getBookingStats = async (req, res) => {
  try {
    const memberId = req.member._id;

    const totalBookings = await Booking.countDocuments({ member: memberId });
    const completedBookings = await Booking.countDocuments({ member: memberId, status: 'completed' });
    const cancelledBookings = await Booking.countDocuments({ member: memberId, status: 'cancelled' });
    const upcomingBookings = await Booking.countDocuments({ 
      member: memberId, 
      status: 'booked',
    });

    const member = await Member.findById(memberId);

    res.json({
      totalBookings,
      completedBookings,
      cancelledBookings,
      upcomingBookings,
      remainingSessions: member.remainingSessions,
      totalSessions: member.totalSessions,
      totalCheckIns: member.checkIns.length,
    });
  } catch (error) {
    res.status(500).json({ message: '获取统计数据失败', error: error.message });
  }
};

module.exports = {
  getMyBookings,
  getBookingById,
  createBooking,
  cancelBooking,
  checkInBooking,
  getBookingStats,
};
