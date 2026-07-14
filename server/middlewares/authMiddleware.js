module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/auth/login-user');
    }
    next();
};

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
};

module.exports.isHost = (req, res, next) => {
    if (!req.isAuthenticated() || req.user.role !== 'host') {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect('/auth/login-host');
    }
    next();
};
