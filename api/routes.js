/**
 * API keys and Passport configuration.
 */
var passport = require('passport');
var passportConfig = require('../config/passport');

var csvController = require('./controllers/csv');
var hoursController = require('./controllers/hours');
var projectsController = require('./controllers/projects');

module.exports = function (app) {
    /**
     * API for user project hours.
     */
    app.get('/api/hours/me', passportConfig.isAuthenticated, hoursController.getHoursCurrentWeek);
    app.get('/api/hours/me/week/:num', passportConfig.isAuthenticated, hoursController.getHoursSpecificWeek);
    app.get('/api/hours/me/me/weeks/:num', passportConfig.isAuthenticated, hoursController.getHoursPastWeeks);

    app.get('/api/hours/', passportConfig.isAuthenticated, hoursController.getAllHoursCurrentWeek);
    app.get('/api/hours/week/:num', passportConfig.isAuthenticated, hoursController.getAllHoursSpecificWeek);
    app.get('/api/hours/weeks/:num', passportConfig.isAuthenticated, hoursController.getAllHoursPastWeeks);

    app.get('/api/projects/', passportConfig.isAuthenticated, projectsController.getAllProjects);
    app.put('/api/projects', passportConfig.isAuthenticated, projectsController.putProjects);

    app.put('/api/hours/me', passportConfig.isAuthenticated, hoursController.putHours);

    app.get('/api/csv/:num', passportConfig.isAuthenticated, csvController.getAllHoursPastWeeksCSV);

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