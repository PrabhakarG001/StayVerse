const express = require('express');
const router = express.Router();
const listingsController = require('../controllers/listingsController');
const { isLoggedIn, isHost } = require('../middlewares/authMiddleware');
const { wrapAsync } = require('../middlewares/errorMiddleware');
const { validateListing, validateReview } = require('../middlewares/validationMiddleware');

router.get('/', wrapAsync(listingsController.renderIndex));
router.get('/new', isLoggedIn, isHost, listingsController.renderNewForm);
router.post('/', isLoggedIn, isHost, validateListing, wrapAsync(listingsController.createListing));

router.get('/:id', wrapAsync(listingsController.showListing));
router.get('/:id/edit', isLoggedIn, isHost, wrapAsync(listingsController.renderEditForm));
router.put('/:id', isLoggedIn, isHost, validateListing, wrapAsync(listingsController.updateListing));
router.delete('/:id', isLoggedIn, isHost, wrapAsync(listingsController.deleteListing));

// Reviews
router.post('/:id/reviews', validateReview, wrapAsync(listingsController.createReview));
router.delete('/:id/reviews/:reviewId', wrapAsync(listingsController.deleteReview));

module.exports = router;
