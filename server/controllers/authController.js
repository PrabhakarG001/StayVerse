const User = require('../models/user');
const passport = require('passport');
const bcrypt = require('bcrypt');

module.exports.renderLoginUser = (req, res) => {
    res.render('pages/auth/login-user');
};

module.exports.renderLoginHost = (req, res) => {
    res.render('pages/auth/login-host');
};

module.exports.loginUser = (req, res, next) => {
    passport.authenticate('local-user', (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            req.flash('error', info.message);
            return res.redirect('/auth/login-user');
        }
        req.logIn(user, (err) => {
            if (err) return next(err);
            req.flash('success', 'Logged in successfully as User!');
            const redirectUrl = req.session.returnTo || '/';
            delete req.session.returnTo;
            res.redirect(redirectUrl);
        });
    })(req, res, next);
};

module.exports.loginHost = (req, res, next) => {
    passport.authenticate('local-host', (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            req.flash('error', info.message);
            return res.redirect('/auth/login-host');
        }
        req.logIn(user, (err) => {
            if (err) return next(err);
            req.flash('success', 'Logged in successfully as Host!');
            res.redirect('/listings/new');
        });
    })(req, res, next);
};

module.exports.register = async (req, res, next) => {
    try {
        const { name, email, phone, password, role } = req.body;
        
        // Basic validation
        if (!name || (!email && !phone) || !password || !role) {
            req.flash('error', 'Please provide all required fields.');
            return res.redirect(`/auth/login-${role}`);
        }

        const cleanEmail = email ? email.trim().toLowerCase() : null;
        
        let queryConditions = [];
        if (cleanEmail) queryConditions.push({ email: cleanEmail });
        if (phone) queryConditions.push({ phone: phone });
        
        if (queryConditions.length > 0) {
            const existingUser = await User.findOne({ $or: queryConditions });
            if (existingUser) {
                req.flash('error', 'User with this email or phone already exists.');
                return res.redirect(`/auth/login-${role}`);
            }
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        
        const user = new User({
            name,
            email: cleanEmail,
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
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash('success', 'Logged out successfully!');
        res.redirect('/');
    });
};
