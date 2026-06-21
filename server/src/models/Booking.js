const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true,
  },
  courseSlot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CourseSlot',
    required: true,
  },
  coach: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coach',
    required: true,
  },
  status: {
    type: String,
    enum: ['booked', 'cancelled', 'completed', 'no_show', 'refunded'],
    default: 'booked',
  },
  bookingTime: {
    type: Date,
    default: Date.now,
  },
  cancelTime: {
    type: Date,
  },
  cancelReason: {
    type: String,
    default: '',
  },
  refunded: {
    type: Boolean,
    default: false,
  },
  checkedIn: {
    type: Boolean,
    default: false,
  },
  checkInTime: {
    type: Date,
  },
  price: {
    type: Number,
    required: true,
  },
  review: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review',
  },
}, {
  timestamps: true,
});

bookingSchema.index({ member: 1, courseSlot: 1 }, { unique: true });

module.exports = mongoose.model('Booking', bookingSchema);
