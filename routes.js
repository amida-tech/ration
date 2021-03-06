'use strict';

/**
 * Controllers (route handlers).
 */
var hoursController = require('./api/controllers/hours');
var userController = require('./api/controllers/user');
var projectController = require('./api/controllers/projects');
var reportsController = require('./api/controllers/reports');

/**
 * API keys and Passport configuration.
 */
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
    app.post('/account/password',
        passportConfig.isAuthenticated, userController.postUpdatePassword);
    app.post('/account/delete',
        passportConfig.isAuthenticated, userController.postDeleteAccount);
    app.get('/account/unlink/:provider',
        passportConfig.isAuthenticated, userController.getOauthUnlink);
    app.get('/dashboard', passportConfig.isAuthenticated, hoursController.dashboard);
    app.get('/myhours', passportConfig.isAuthenticated, hoursController.myHours);
    app.get('/projects', passportConfig.isAuthenticated,
        passportConfig.needsRole('admin'), projectController.projects);
    app.get('/users', passportConfig.isAuthenticated,
        passportConfig.needsRole('admin'), userController.getUsers);
    app.get('/reports', passportConfig.isAuthenticated, reportsController.reports);
    app.get('/reports/person', passportConfig.isAuthenticated, reportsController.Person);
    app.get('/reports/project', passportConfig.isAuthenticated, reportsController.Project);
};
