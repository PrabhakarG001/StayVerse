const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');
const bcrypt = require('bcrypt');

// Render User Login Page
router.get('/login-user', (req, res) => {
    res.render('auth/login-user');
});

// Render Host Login Page
router.get('/login-host', (req, res) => {
    res.render('auth/login-host');
});

// Local Strategy Login (User)
router.post('/login-user', passport.authenticate('local', {
    failureRedirect: '/auth/login-user',
    failureFlash: true
}), (req, res) => {
    // If successful, check role
    if (req.user.role === 'host') {
        req.flash('success', 'Logged in successfully as Host!');
        res.redirect('/listings/new');
    } else {
        req.flash('success', 'Logged in successfully as User!');
        const redirectUrl = req.session.returnTo || '/';
        delete req.session.returnTo;
        res.redirect(redirectUrl);
    }
});

// Local Strategy Login (Host)
router.post('/login-host', passport.authenticate('local', {
    failureRedirect: '/auth/login-host',
    failureFlash: true
}), (req, res) => {
    // If successful, check role
    if (req.user.role === 'host') {
        req.flash('success', 'Logged in successfully as Host!');
        res.redirect('/listings/new');
    } else {
        req.flash('success', 'Logged in successfully as User!');
        res.redirect('/');
    }
});

// Local Strategy Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, phone, password, role } = req.body;
        
        // Basic validation
        if (!name || (!email && !phone) || !password || !role) {
            req.flash('error', 'Please provide all required fields.');
            return res.redirect(`/auth/login-${role}`);
        }

        const existingUser = await User.findOne({ $or: [{ email: email || null }, { phone: phone || null }] });
        if (existingUser) {
            req.flash('error', 'User with this email or phone already exists.');
            return res.redirect(`/auth/login-${role}`);
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        
        const user = new User({
            name,
            email,
            phone,
            password: hashedPassword,
            role,
            authProvider: 'local'
        });

        await user.save();
        
        // Automatically log them in after registration
        req.login(user, err => {
            if (err) return next(err);
            req.flash('success', `Welcome to StayVerse, ${name}!`);
            if (role === 'host') {
                res.redirect('/listings/new');
            } else {
                res.redirect('/');
            }
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect(`/auth/login-${req.body.role || 'user'}`);
    }
});

// Social Login Stubs
router.get('/google', (req, res) => {
    // Ideally: passport.authenticate('google', { scope: ['profile', 'email'] })
    req.flash('error', 'Google Auth is not fully configured (Missing API Keys).');
    res.redirect('/auth/login-user');
});

router.get('/apple', (req, res) => {
    req.flash('error', 'Apple Auth is not fully configured.');
    res.redirect('/auth/login-user');
});

router.get('/phone', (req, res) => {
    req.flash('error', 'Phone Auth requires OTP configuration.');
    res.redirect('/auth/login-user');
});

// Logout
router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash('success', 'Logged out successfully!');
        res.redirect('/');
    });
});

module.exports = router;
