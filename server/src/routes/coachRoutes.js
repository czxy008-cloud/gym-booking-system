const express = require('express');
const router = express.Router();
const {
  getAllCoaches,
  getCoachById,
  createCoach,
  updateCoach,
  deleteCoach,
  getCoachSpecialties,
} = require('../controllers/coachController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getAllCoaches);
router.get('/specialties', getCoachSpecialties);
router.get('/:id', getCoachById);
router.post('/', protect, admin, createCoach);
router.put('/:id', protect, admin, updateCoach);
router.delete('/:id', protect, admin, deleteCoach);

module.exports = router;
