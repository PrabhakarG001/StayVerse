const express = require('express');
const router = express.Router();
const hotelsController = require('../controllers/hotelsController');
const { wrapAsync } = require('../middlewares/errorMiddleware');

router.get('/', (req, res) => res.redirect('/hotels/search?query=Worldwide'));
router.get('/search', hotelsController.renderSearchPage);
router.get('/show/:id', wrapAsync(hotelsController.showHotelDetail));

module.exports = router;
