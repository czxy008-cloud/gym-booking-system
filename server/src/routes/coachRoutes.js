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

router.get('/', getAllCoaches);
router.get('/specialties', getCoachSpecialties);
router.get('/:id', getCoachById);
router.post('/', createCoach);
router.put('/:id', updateCoach);
router.delete('/:id', deleteCoach);

module.exports = router;
