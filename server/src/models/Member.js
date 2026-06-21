const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '会员姓名不能为空'],
    trim: true,
  },
  avatar: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    required: [true, '手机号不能为空'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, '密码不能为空'],
  },
  remainingSessions: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalSessions: {
    type: Number,
    default: 0,
  },
  membershipType: {
    type: String,
    enum: ['月卡', '季卡', '年卡', '次卡'],
    default: '次卡',
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'frozen'],
    default: 'active',
  },
  checkIns: [{
    date: {
      type: Date,
      default: Date.now,
    },
    type: {
      type: String,
      enum: ['course', 'gym'],
      default: 'gym',
    },
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Member', memberSchema);
