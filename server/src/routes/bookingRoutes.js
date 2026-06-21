const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getMyBookings,
  getBookingById,
  createBooking,
  cancelBooking,
  checkInBooking,
  getBookingStats,
} = require('../controllers/bookingController');

router.get('/stats', protect, getBookingStats);
router.get('/', protect, getMyBookings);
router.get('/:id', protect, getBookingById);
router.post('/', protect, createBooking);
router.put('/:id/cancel', protect, cancelBooking);
router.put('/:id/checkin', protect, checkInBooking);

module.exports = router;
