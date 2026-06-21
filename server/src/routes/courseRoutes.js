const express = require('express');
const router = express.Router();
const {
  getCourseSlots,
  getCourseSlotById,
  createCourseSlot,
  createBatchCourseSlots,
  updateCourseSlot,
  deleteCourseSlot,
  getWeeklySchedule,
} = require('../controllers/courseController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getCourseSlots);
router.get('/weekly', getWeeklySchedule);
router.get('/:id', getCourseSlotById);
router.post('/', protect, admin, createCourseSlot);
router.post('/batch', protect, admin, createBatchCourseSlots);
router.put('/:id', protect, admin, updateCourseSlot);
router.delete('/:id', protect, admin, deleteCourseSlot);

module.exports = router;
