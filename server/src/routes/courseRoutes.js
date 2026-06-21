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

router.get('/', getCourseSlots);
router.get('/weekly', getWeeklySchedule);
router.get('/:id', getCourseSlotById);
router.post('/', createCourseSlot);
router.post('/batch', createBatchCourseSlots);
router.put('/:id', updateCourseSlot);
router.delete('/:id', deleteCourseSlot);

module.exports = router;
