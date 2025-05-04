// middleware/authMiddleware.js
module.exports = {
    isLoggedIn: function (req, res, next) {
        if (req.session && req.session.user) {
            return next();
        } else {
            return res.redirect('/login');
        }
    },
    isLoggedOut: function (req, res, next) {
        if (!req.session || !req.session.user) {
            return next();
        } else {
            return res.redirect('/dashboard');
        }
    }
};
