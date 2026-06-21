const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createReview,
  getMyReviews,
  getCoachReviews,
  updateReview,
  approveReview,
  rejectReview,
  getPendingReviews,
} = require('../controllers/reviewController');

router.get('/mine', protect, getMyReviews);
router.get('/pending', getPendingReviews);
router.get('/coach/:coachId', getCoachReviews);
router.post('/', protect, createReview);
router.put('/:id', protect, updateReview);
router.put('/:id/approve', approveReview);
router.put('/:id/reject', rejectReview);

module.exports = router;
