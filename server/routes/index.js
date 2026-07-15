const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const pagesRoutes = require('./pagesRoutes');
const listingRoutes = require('./listingRoutes');
const hotelRoutes = require('./hotelRoutes');
const bookingRoutes = require('./bookingRoutes');
const wishlistRoutes = require('./wishlistRoutes');
const userRoutes = require('./userRoutes');
const hotelsController = require('../controllers/hotelsController');
const { wrapAsync } = require('../middlewares/errorMiddleware');

// Mount Sub-routers
router.use('/auth', authRoutes);
router.use('/listings', listingRoutes);
router.use('/hotels', hotelRoutes);
router.use('/pages', pagesRoutes);
router.use('/', bookingRoutes);
router.use('/', wishlistRoutes);

// Compatibility redirects requested by user
router.get('/home', (req, res) => res.redirect('/'));
router.get('/user/bookings', (req, res) => res.redirect('/bookings?tab=past'));
router.get('/host/register', (req, res) => res.redirect('/auth/login-host'));

router.use('/', userRoutes);

// Hotel API Routes (keeping them at root scope matching original app.js)
router.get('/api/hotels/render-slider', wrapAsync(hotelsController.renderSliderAPI));
router.get('/api/hotels/render-search', wrapAsync(hotelsController.renderSearchAPI));
router.get('/api/hotels/search', wrapAsync(hotelsController.searchHotelsAPI));
router.get('/api/hotels/meta', hotelsController.metaBookingSearch);
router.get('/api/hotels/:city', wrapAsync(hotelsController.getHotelsByCityAPI));
router.get('/api/hotels', wrapAsync(hotelsController.getHotelsAPI));
router.post('/api/hotels/sync', wrapAsync(hotelsController.syncHotels));
router.get('/api/destinations', wrapAsync(hotelsController.getDestinations));

module.exports = router;
