'use strict';

/**
 * API keys and Passport configuration.
 */
var passport = require('passport');
var passportConfig = require('../config/passport');

var csvController = require('./controllers/csv');
var hoursController = require('./controllers/hours');
var projectsController = require('./controllers/projects');
var userController = require('./controllers/user');

module.exports = function (app) {
    /**
     * API for user project hours.
     */
    app.get('/api/hours/me',
    passportConfig.isAuthenticated, hoursController.getHoursCurrentWeek);
    app.get('/api/hours/me/week/:num',
    passportConfig.isAuthenticated, hoursController.getHoursSpecificWeek);
    app.get('/api/hours/me/weeks/:num',
    passportConfig.isAuthenticated, hoursController.getHoursPastWeeks);

    app.get('/api/hours/',
    passportConfig.isAuthenticated, hoursController.getAllHoursCurrentWeek);
    app.get('/api/hours/week/:num',
    passportConfig.isAuthenticated, hoursController.getAllHoursSpecificWeek);
    app.get('/api/hours/weeks/:num',
    passportConfig.isAuthenticated, hoursController.getAllHoursPastWeeks);

    app.put('/api/projects', passportConfig.isAuthenticated,
    passportConfig.needsRole('admin'), projectsController.putProjects);

    app.put('/api/hours/me', passportConfig.isAuthenticated, hoursController.putHours);
    app.put('/api/hours/:userid/:week', passportConfig.isAuthenticated,
    passportConfig.needsRole('admin'), hoursController.putHoursByUserByWeek);

    app.get('/api/csv/:num',
    passportConfig.isAuthenticated, csvController.getAllHoursPastWeeksCSV);

    /**
     * API for user accounts.
     */
    app.get('/api/account', passportConfig.isAuthenticated, userController.getAPIAccount);
    app.post('/api/account/roles',
    passportConfig.isAuthenticated, userController.postAPIUpdateRoles);
    app.post('/api/account/deactivate', passportConfig.isAuthenticated,
    passportConfig.needsRole('admin'), userController.postDeactivateUser);
    app.post('/api/account/delete', passportConfig.isAuthenticated,
    passportConfig.needsRole('admin'), userController.postDeleteUser);

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
};