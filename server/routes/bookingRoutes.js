const express = require('express');
const router = express.Router();
const bookingsController = require('../controllers/bookingsController');
const { isLoggedIn, isHost } = require('../middlewares/authMiddleware');
const { wrapAsync } = require('../middlewares/errorMiddleware');

router.get('/my-bookings', isLoggedIn, wrapAsync(bookingsController.renderMyBookings));
router.get('/my-host', isLoggedIn, isHost, wrapAsync(bookingsController.renderMyHost));
router.post('/api/bookings', isLoggedIn, wrapAsync(bookingsController.createBooking));

module.exports = router;
