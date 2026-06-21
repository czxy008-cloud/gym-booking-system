const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Coach = require('../models/Coach');
const Member = require('../models/Member');

const createReview = async (req, res) => {
  try {
    const { bookingId, rating, content, tags } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: '预约不存在' });
    }

    if (booking.member.toString() !== req.member._id.toString()) {
      return res.status(403).json({ message: '无权评价此预约' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ message: '课程完成后才能评价' });
    }

    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      return res.status(400).json({ message: '已评价过该课程' });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: '评分必须在1-5之间' });
    }

    const review = await Review.create({
      booking: bookingId,
      member: req.member._id,
      coach: booking.coach,
      rating,
      content: content || '',
      tags: tags || [],
      status: 'pending',
      isPublic: false,
    });

    booking.review = review._id;
    await booking.save();

    const populatedReview = await Review.findById(review._id)
      .populate('member', 'name avatar')
      .populate('coach', 'name');

    res.status(201).json({
      message: '评价提交成功，等待审核',
      review: populatedReview,
    });
  } catch (error) {
    res.status(500).json({ message: '评价提交失败', error: error.message });
  }
};

const getMyReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { member: req.member._id };

    if (status) {
      query.status = status;
    }

    const reviews = await Review.find(query)
      .populate('coach', 'name avatar specialties')
      .populate('booking')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Review.countDocuments(query);

    res.json({
      reviews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: '获取评价列表失败', error: error.message });
  }
};

const getCoachReviews = async (req, res) => {
  try {
    const { coachId } = req.params;
    const { page = 1, limit = 10, rating } = req.query;

    const query = {
      coach: coachId,
      status: 'approved',
      isPublic: true,
    };

    if (rating) {
      query.rating = Number(rating);
    }

    const reviews = await Review.find(query)
      .populate('member', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Review.countDocuments(query);

    const coach = await Coach.findById(coachId);

    const ratingStats = await Review.aggregate([
      { $match: { coach: coach._id, status: 'approved', isPublic: true } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
    ]);

    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratingStats.forEach(stat => {
      ratingDistribution[stat._id] = stat.count;
    });

    res.json({
      reviews,
      coachInfo: {
        name: coach.name,
        avatar: coach.avatar,
        rating: coach.rating,
        reviewCount: coach.reviewCount,
      },
      ratingDistribution,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: '获取教练评价失败', error: error.message });
  }
};

const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, tags } = req.body;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: '评价不存在' });
    }

    if (review.member.toString() !== req.member._id.toString()) {
      return res.status(403).json({ message: '无权修改此评价' });
    }

    if (review.status === 'approved') {
      return res.status(400).json({ message: '已审核的评价无法修改' });
    }

    review.content = content !== undefined ? content : review.content;
    review.tags = tags || review.tags;

    await review.save();

    res.json({
      message: '评价更新成功',
      review,
    });
  } catch (error) {
    res.status(500).json({ message: '更新评价失败', error: error.message });
  }
};

const approveReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: '评价不存在' });
    }

    review.status = 'approved';
    review.isPublic = true;
    await review.save();

    await updateCoachRating(review.coach);

    res.json({
      message: '评价审核通过',
      review,
    });
  } catch (error) {
    res.status(500).json({ message: '审核失败', error: error.message });
  }
};

const rejectReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: '评价不存在' });
    }

    review.status = 'rejected';
    review.isPublic = false;
    await review.save();

    res.json({
      message: '评价已驳回',
      reason: reason || '',
    });
  } catch (error) {
    res.status(500).json({ message: '驳回失败', error: error.message });
  }
};

const getPendingReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ status: 'pending' })
      .populate('member', 'name avatar')
      .populate('coach', 'name')
      .populate('booking')
      .sort({ createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Review.countDocuments({ status: 'pending' });

    res.json({
      reviews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: '获取待审核评价失败', error: error.message });
  }
};

const updateCoachRating = async (coachId) => {
  const approvedReviews = await Review.find({
    coach: coachId,
    status: 'approved',
    isPublic: true,
  });

  if (approvedReviews.length === 0) {
    await Coach.findByIdAndUpdate(coachId, {
      rating: 0,
      reviewCount: 0,
    });
    return;
  }

  const totalRating = approvedReviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / approvedReviews.length;

  await Coach.findByIdAndUpdate(coachId, {
    rating: Math.round(averageRating * 10) / 10,
    reviewCount: approvedReviews.length,
  });
};

module.exports = {
  createReview,
  getMyReviews,
  getCoachReviews,
  updateReview,
  approveReview,
  rejectReview,
  getPendingReviews,
};
