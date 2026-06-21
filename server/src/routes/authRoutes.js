const express = require('express');
const router = express.Router();
const {
  registerMember,
  loginMember,
  getMemberProfile,
  updateMemberProfile,
  checkIn,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerMember);
router.post('/login', loginMember);
router.get('/profile', protect, getMemberProfile);
router.put('/profile', protect, updateMemberProfile);
router.post('/checkin', protect, checkIn);

module.exports = router;
