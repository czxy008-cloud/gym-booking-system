const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
  },
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true,
  },
  coach: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coach',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  content: {
    type: String,
    default: '',
    trim: true,
    maxlength: 500,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  reply: {
    type: String,
    default: '',
  },
  replyTime: {
    type: Date,
  },
  rejectReason: {
    type: String,
    default: '',
  },
  tags: [{
    type: String,
  }],
}, {
  timestamps: true,
});

reviewSchema.index({ coach: 1, status: 1 });
reviewSchema.index({ member: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
