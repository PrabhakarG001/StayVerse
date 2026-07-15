const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const { isLoggedIn } = require('../middlewares/authMiddleware');
const { wrapAsync } = require('../middlewares/errorMiddleware');

// Messages Page Placeholder
router.get('/messages', isLoggedIn, (req, res) => {
    res.render('pages/messages', { page: 'messages' });
});

router.get('/bookings', (req, res) => res.redirect('/my-bookings'));

// Connections Page
router.get('/connections', isLoggedIn, (req, res) => {
    res.render('pages/connections', { page: 'connections' });
});

// Profile Page
router.get('/profile', isLoggedIn, (req, res) => {
    res.render('pages/profile', { page: 'profile' });
});

// Edit Profile
router.post('/profile/edit', isLoggedIn, wrapAsync(async (req, res) => {
    const { name, password } = req.body;
    const user = await User.findById(req.user._id);
    
    if (name && name.trim().length > 0) {
        user.name = name.trim();
    }
    
    if (password && password.trim().length > 0) {
        const hash = await bcrypt.hash(password, 10);
        user.password = hash;
    }
    
    await user.save();
    req.flash('success', 'Profile updated successfully!');
    res.redirect('/profile');
}));

module.exports = router;
