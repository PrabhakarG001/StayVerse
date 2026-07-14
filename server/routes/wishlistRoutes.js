const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { wrapAsync } = require('../middlewares/errorMiddleware');

router.get('/wishlists', wishlistController.renderWishlistPage);
router.get('/api/wishlists', wishlistController.getWishlistAPI);
router.post('/api/wishlists/toggle', wrapAsync(wishlistController.toggleWishlistAPI));

module.exports = router;
