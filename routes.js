/**
 * Controllers (route handlers).
 */
var userController = require('./controllers/user');
var hoursController = require('./controllers/hours');

/**
 * API keys and Passport configuration.
 */
var passport = require('passport');
var passportConfig = require('./config/passport');

module.exports = function (app) {

    /**
     * Primary app routes.
     */
    app.get('/', passportConfig.isAuthenticated, hoursController.dashboard);
    app.get('/login', userController.getLogin);
    app.post('/login', userController.postLogin);
    app.get('/logout', userController.logout);
    app.get('/forgot', userController.getForgot);
    app.post('/forgot', userController.postForgot);
    app.get('/reset/:token', userController.getReset);
    app.post('/reset/:token', userController.postReset);
    app.get('/signup', userController.getSignup);
    app.post('/signup', userController.postSignup);
    app.get('/account', passportConfig.isAuthenticated, userController.getAccount);
    app.post('/account/profile', passportConfig.isAuthenticated, userController.postUpdateProfile);
    app.post('/account/password', passportConfig.isAuthenticated, userController.postUpdatePassword);
    app.post('/account/delete', passportConfig.isAuthenticated, userController.postDeleteAccount);
    app.get('/account/unlink/:provider', passportConfig.isAuthenticated, userController.getOauthUnlink);
    app.get('/dashboard', passportConfig.isAuthenticated, hoursController.dashboard);
    app.get('/myhours', passportConfig.isAuthenticated, hoursController.myHours);

    /**
     * API for user project hours.
     */
    app.get('/api/hours', hoursController.getAllHours);
    app.get('/api/hours/me', hoursController.getHours);
    app.put('/api/hours/me', hoursController.putHours);

    /**
     * OAuth authentication routes. (Sign in)
     */
    app.get('/auth/google', passport.authenticate('google', {
        scope: 'profile email'
    }));
    app.get(process.env.GOOGLE_CALLBACK, passport.authenticate('google', {
        failureRedirect: '/login'
    }), function (req, res) {
        res.redirect(req.session.returnTo || '/');
    });

}
