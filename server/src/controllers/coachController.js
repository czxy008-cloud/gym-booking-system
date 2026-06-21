const Coach = require('../models/Coach');

const getAllCoaches = async (req, res) => {
  try {
    const { specialty, page = 1, limit = 10 } = req.query;
    const query = { status: 'active' };

    if (specialty) {
      query.specialties = specialty;
    }

    const coaches = await Coach.find(query)
      .sort({ rating: -1, reviewCount: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Coach.countDocuments(query);

    res.json({
      coaches,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: '获取教练列表失败', error: error.message });
  }
};

const getCoachById = async (req, res) => {
  try {
    const coach = await Coach.findById(req.params.id);
    if (!coach) {
      return res.status(404).json({ message: '教练不存在' });
    }
    res.json(coach);
  } catch (error) {
    res.status(500).json({ message: '获取教练信息失败', error: error.message });
  }
};

const createCoach = async (req, res) => {
  try {
    const coach = await Coach.create(req.body);
    res.status(201).json(coach);
  } catch (error) {
    res.status(400).json({ message: '创建教练失败', error: error.message });
  }
};

const updateCoach = async (req, res) => {
  try {
    const coach = await Coach.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!coach) {
      return res.status(404).json({ message: '教练不存在' });
    }
    res.json(coach);
  } catch (error) {
    res.status(400).json({ message: '更新教练失败', error: error.message });
  }
};

const deleteCoach = async (req, res) => {
  try {
    const coach = await Coach.findById(req.params.id);
    if (!coach) {
      return res.status(404).json({ message: '教练不存在' });
    }
    coach.status = 'inactive';
    await coach.save();
    res.json({ message: '教练已停用' });
  } catch (error) {
    res.status(500).json({ message: '删除教练失败', error: error.message });
  }
};

const getCoachSpecialties = async (req, res) => {
  try {
    const specialties = await Coach.distinct('specialties', { status: 'active' });
    res.json(specialties);
  } catch (error) {
    res.status(500).json({ message: '获取课程类型失败', error: error.message });
  }
};

module.exports = {
  getAllCoaches,
  getCoachById,
  createCoach,
  updateCoach,
  deleteCoach,
  getCoachSpecialties,
};
