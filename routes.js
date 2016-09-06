/**
 * Controllers (route handlers).
 */
var hoursController = require('./api/controllers/hours');
var letsencryptController = require('./api/controllers/letsencrypt');
var userController = require('./api/controllers/user');

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
}
