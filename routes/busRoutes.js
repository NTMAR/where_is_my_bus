const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { protect, isOperator } = require('../middleware/authMiddleware');

const {
  addBus,
  getOwnerBuses,
  deleteBus,
  searchBuses,
  getAllStops,
  getBusDetails,
  getDeparturesByStop
} = require('../controllers/busController');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// --- Routes for Public Users ---
router.get('/search', searchBuses);
router.get('/stops', getAllStops);
router.get('/departures/:stopName', getDeparturesByStop);

// --- Routes for Bus Owners (Now Protected) ---
router.post(
  '/',
  [
    protect,
    isOperator,
    [
      check('busName', 'Bus name is required').not().isEmpty().trim().escape(),
      check('price', 'Price must be a positive number').isFloat({ gt: 0 }),
      check('stops', 'A bus route must have at least two stops').isArray({ min: 2 }),
      check('stops.*.name', 'Stop name cannot be empty').not().isEmpty().trim().escape(),
      check('stops.*.time', 'Stop time cannot be empty').not().isEmpty(),
    ],
  ],
  handleValidationErrors,
  addBus
);
router.get('/mybuses', protect, isOperator, getOwnerBuses);

// --- delete buses ---
router.delete('/:id', protect, isOperator, deleteBus);

// --- Dynamic route must be last ---
router.get('/:id', getBusDetails);

module.exports = router;