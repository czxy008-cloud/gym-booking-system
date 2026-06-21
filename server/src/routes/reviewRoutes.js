const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  createReview,
  getMyReviews,
  getCoachReviews,
  updateReview,
  approveReview,
  rejectReview,
  getPendingReviews,
  getAllReviews,
} = require('../controllers/reviewController');

router.get('/', protect, admin, getAllReviews);
router.get('/mine', protect, getMyReviews);
router.get('/pending', protect, admin, getPendingReviews);
router.get('/coach/:coachId', getCoachReviews);
router.post('/', protect, createReview);
router.put('/:id', protect, updateReview);
router.put('/:id/approve', protect, admin, approveReview);
router.put('/:id/reject', protect, admin, rejectReview);

module.exports = router;
