const express = require('express');
const router = express.Router();
const pagesController = require('../controllers/pagesController');

router.get('/:slug', pagesController.renderStory);

module.exports = router;
