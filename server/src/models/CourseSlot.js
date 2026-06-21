const mongoose = require('mongoose');

const courseSlotSchema = new mongoose.Schema({
  coach: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coach',
    required: true,
  },
  courseType: {
    type: String,
    enum: ['瑜伽', '增肌', '减脂', '塑形', '康复', '搏击', '普拉提', '有氧'],
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  capacity: {
    type: Number,
    default: 1,
    min: 1,
  },
  bookedCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  status: {
    type: String,
    enum: ['available', 'full', 'cancelled', 'completed'],
    default: 'available',
  },
  price: {
    type: Number,
    required: true,
    default: 200,
  },
  description: {
    type: String,
    default: '',
  },
  location: {
    type: String,
    default: '私教区',
  },
}, {
  timestamps: true,
});

courseSlotSchema.index({ coach: 1, date: 1, startTime: 1 }, { unique: true });

courseSlotSchema.methods.isFull = function() {
  return this.bookedCount >= this.capacity;
};

courseSlotSchema.methods.hasConflict = function() {
  return this.bookedCount > 0;
};

module.exports = mongoose.model('CourseSlot', courseSlotSchema);
