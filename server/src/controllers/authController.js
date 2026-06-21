const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Member = require('../models/Member');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const registerMember = async (req, res) => {
  try {
    const { name, phone, password, membershipType } = req.body;

    const memberExists = await Member.findOne({ phone });
    if (memberExists) {
      return res.status(400).json({ message: '该手机号已注册' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const member = await Member.create({
      name,
      phone,
      password: hashedPassword,
      membershipType: membershipType || '次卡',
      remainingSessions: membershipType === '月卡' ? 30 : (membershipType === '季卡' ? 90 : (membershipType === '年卡' ? 365 : 10)),
      totalSessions: membershipType === '月卡' ? 30 : (membershipType === '季卡' ? 90 : (membershipType === '年卡' ? 365 : 10)),
    });

    res.status(201).json({
      _id: member._id,
      name: member.name,
      phone: member.phone,
      token: generateToken(member._id),
    });
  } catch (error) {
    res.status(500).json({ message: '注册失败', error: error.message });
  }
};

const loginMember = async (req, res) => {
  try {
    const { phone, password } = req.body;

    const member = await Member.findOne({ phone });
    if (!member) {
      return res.status(401).json({ message: '手机号或密码错误' });
    }

    const isMatch = await bcrypt.compare(password, member.password);
    if (!isMatch) {
      return res.status(401).json({ message: '手机号或密码错误' });
    }

    if (member.status !== 'active') {
      return res.status(401).json({ message: '账户已被禁用或冻结' });
    }

    res.json({
      _id: member._id,
      name: member.name,
      phone: member.phone,
      remainingSessions: member.remainingSessions,
      membershipType: member.membershipType,
      token: generateToken(member._id),
    });
  } catch (error) {
    res.status(500).json({ message: '登录失败', error: error.message });
  }
};

const getMemberProfile = async (req, res) => {
  try {
    const member = await Member.findById(req.member._id).select('-password');
    res.json(member);
  } catch (error) {
    res.status(500).json({ message: '获取个人信息失败', error: error.message });
  }
};

const updateMemberProfile = async (req, res) => {
  try {
    const member = await Member.findById(req.member._id);
    if (!member) {
      return res.status(404).json({ message: '会员不存在' });
    }

    member.name = req.body.name || member.name;
    member.avatar = req.body.avatar || member.avatar;

    const updatedMember = await member.save();
    res.json({
      _id: updatedMember._id,
      name: updatedMember.name,
      phone: updatedMember.phone,
      avatar: updatedMember.avatar,
    });
  } catch (error) {
    res.status(500).json({ message: '更新失败', error: error.message });
  }
};

const checkIn = async (req, res) => {
  try {
    const member = await Member.findById(req.member._id);
    if (!member) {
      return res.status(404).json({ message: '会员不存在' });
    }

    member.checkIns.push({
      date: new Date(),
      type: 'gym',
    });

    await member.save();
    res.json({ message: '打卡成功', checkInTime: new Date() });
  } catch (error) {
    res.status(500).json({ message: '打卡失败', error: error.message });
  }
};

module.exports = {
  registerMember,
  loginMember,
  getMemberProfile,
  updateMemberProfile,
  checkIn,
};
