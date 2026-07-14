const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { wrapAsync } = require('../middlewares/errorMiddleware');

router.get('/login-user', authController.renderLoginUser);
router.get('/login-host', authController.renderLoginHost);
router.post('/login-user', authController.loginUser);
router.post('/login-host', authController.loginHost);
router.post('/register', wrapAsync(authController.register));
router.get('/logout', authController.logout);

// Social login mock stubs (keeping features identical)
router.get('/google', (req, res) => {
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

module.exports = router;
