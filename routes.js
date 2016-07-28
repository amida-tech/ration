/**
 * Controllers (route handlers).
 */
var userController = require('./controllers/user');
var hoursController = require('./controllers/hours');
var letsencryptController = require('./controllers/letsencrypt');

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
    app.get('/.well-known/acme-challenge/:id', letsencryptController.challenge);

    /**
     * API for user project hours.
     */
    app.get('/api/hours/me', hoursController.getHoursCurrentWeek);
    app.get('/api/hours/me/week/:num', hoursController.getHoursSpecificWeek);
    app.get('/api/hours/me/me/weeks/:num', hoursController.getHoursPastWeeks);
    
    app.get('/api/hours/', hoursController.getAllHoursCurrentWeek);
    app.get('/api/hours/week/:num', hoursController.getAllHoursSpecificWeek);
    app.get('/api/hours/weeks/:num', hoursController.getAllHoursPastWeeks);
    
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
