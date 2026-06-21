const mongoose = require('mongoose');

const coachSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '教练姓名不能为空'],
    trim: true,
  },
  avatar: {
    type: String,
    default: '',
  },
  specialties: [{
    type: String,
    enum: ['瑜伽', '增肌', '减脂', '塑形', '康复', '搏击', '普拉提', '有氧'],
  }],
  bio: {
    type: String,
    default: '',
  },
  experienceYears: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
  phone: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Coach', coachSchema);
