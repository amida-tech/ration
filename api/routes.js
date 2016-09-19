/**
 * API keys and Passport configuration.
 */
var passport = require('passport');
var passportConfig = require('../config/passport');

var csvController = require('./controllers/csv');
var hoursController = require('./controllers/hours');

module.exports = function (app) {
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

    app.get('/api/csv/:num', csvController.getAllHoursPastWeeksCSV);

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