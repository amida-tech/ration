var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var passport = require('passport');
var User = require('../../models/User');
var Hours = require('../../models/Hours');
var Projects = require('../../models/Projects');
var weeksSinceEpoch = require('../../lib/util').weeksSinceEpoch;

/**
 * GET /dashboard
 * Hours dashboard.
 */
exports.dashboard = function (req, res, next) {
    Hours.find({
        week: {
            $gte: weeksSinceEpoch() - 3
        }
    }, function (err, docs) {
        if (err) {
            return next(err);
        }
        var allData = _.groupBy(docs, 'userName');
        var hours = [];

        async.eachOfSeries(allData, function(value, key, cb){
            // look up related user to ensure they are active
            User.findById(value[0].userId, function (err, user) {
                if (err) {
                    return cb(err);
                } else if (user === null) {
                    return cb();
                } else if (user.inactive) {
                    return cb();
                }
                var temp = {
                    name: key,
                    data: _.sortBy(value, 'week'),
                    projects: []
                };
                _.forEach(value, function (val) {
                    _.forEach(val.projects, function (project) {
                        if (temp.projects.indexOf(project.name) < 0) {
                            temp.projects.push(project.name);
                        }
                    });
                });
                hours.push(temp);
                cb();
            });
        }, function(err) {
            if (err) return next(err);
            res.render('hours/dashboard', {
                title: 'Dashboard',
                hours: hours
            });
        });
    });
};

/**
 * GET /myhours
 * Edit current user hours.
 */
exports.myHours = function (req, res, next) {

    Hours.findOne({
        userId: req.user.id,
        week: weeksSinceEpoch()
    }, function (err, doc) {
        if (err) {
            return next(err);
        }

        //Get list of projects for dropdown.
        Projects.find({}, function (err, projects) {
            if (err) {
                return next(err);
            }

            // If there is no Hours doc from the current week,
            // get the most recent Hours doc.
            if (!doc) {
                Hours
                    .findOne({
                        userId: req.user.id
                    })
                    .sort('-week')
                    .exec(function (err, doc) {
                        if (err) {
                            return next(err);
                        }
                        console.log(doc);
                        res.render('hours/myhours', {
                            title: 'My Hours',
                            hours: doc,
                            projects: projects
                        });
                    });
            } else {

                res.render('hours/myhours', {
                    title: 'My Hours',
                    hours: doc,
                    projects: projects
                });
            }

        });
    });
};

// API Routes ======================================

/**
 * GET /api/hours/me
 * Get all hours for the logged in user from the current week.
 */
exports.getHoursCurrentWeek = function (req, res, next) {
    Hours.findOne({
        userId: req.user.id,
        week: weeksSinceEpoch()
    }, function (err, doc) {
        if (err) {
            return next(err);
        }
        res.send(doc);
    });
};

/**
 * GET /api/hours/me/week/:num
 * Get all hours for the logged in user from the specified week.
 */
exports.getHoursSpecificWeek = function (req, res, next) {
    if (req.params.num > weeksSinceEpoch()) {
        return next(new Error("Cannot specify weeks in the future"));
    }

    Hours.findOne({
        userId: req.user.id,
        week: req.params.num
    }, function (err, doc) {
        if (err) {
            return next(err);
        }
        res.send(doc);
    });
};

/**
 * GET /api/hours/me/weeks/:num
 * Get all hours for the logged in user from the past number of weeks.
 */
exports.getHoursPastWeeks = function (req, res, next) {
    if (req.params.num < 1) {
        return next(new Error("Must request at least one week of data"));
    }

    Hours.find({
        userId: req.user.id,
        week: {
            $gte: weeksSinceEpoch() - req.params.num
        }
    }, function (err, docs) {
        if (err) {
            return next(err);
        }
        res.send(docs);
    });
};

/**
 * GET /api/hours
 * Get all hours for all users from the current week.
 */
exports.getAllHoursCurrentWeek = function (req, res, next) {
    Hours.find({
        week: weeksSinceEpoch()
    }, function (err, docs) {
        if (err) {
            return next(err);
        }
        res.send(docs);
    });
};

/**
 * GET /api/hours/week/:num
 * Get all hours for all users from the specified week.
 */
exports.getAllHoursSpecificWeek = function (req, res, next) {
    if (req.params.num > weeksSinceEpoch()) {
        return next(new Error("Cannot specify weeks in the future"));
    }

    Hours.find({
        week: req.params.num
    }, function (err, docs) {
        if (err) {
            return next(err);
        }
        res.send(docs);
    });
};

/**
 * GET /api/hours/weeks/:num
 * Get all hours for all users from the past number of weeks.
 */
exports.getAllHoursPastWeeks = function (req, res, next) {
    if (req.params.num < 1) {
        return next(new Error("Must request at least one week of data"));
    }

    Hours.find({
        week: {
            $gte: weeksSinceEpoch() - req.params.num
        }
    }, function (err, docs) {
        if (err) {
            return next(err);
        }
        res.send(docs);
    });
};

/**
 * PUT /api/hours/me
 * Update the hours entry for the current week for the logged in user.
 */
exports.putHours = function (req, res, next) {
    Hours.findOne({
        userId: req.user.id,
        week: weeksSinceEpoch()
    }, function (err, doc) {
        if (err) {
            return next(err);
        }
        if (!doc) {
            doc = new Hours({
                userId: req.user.id,
                userName: req.user.profile.name,
                projects: req.body.hours
            });
            doc.save(function (err, doc) {
                if (err) {
                    return next(err);
                }
                res.send(doc);
            });
        } else {
            doc.projects = req.body.hours;
            doc.save(function (err, doc) {
                if (err) {
                    return next(err);
                }
                res.send(doc);
            });
        }
    });
};

/**
 * PUT /api/hours/:userid/:week
 * (ADMIN) Update the hours entry for a specific week for the specified user.
 */
exports.putHoursByUserByWeek = function (req, res, next) {
    Hours.findOne({
        userId: req.params.userid,
        week: req.params.week
    }, function (err, doc) {
        if (err) {
            return next(err);
        }
        if (!doc) {
            doc = new Hours({
                userId: req.user.id,
                userName: req.user.profile.name,
                week: req.params.week,
                projects: req.body.hours
            });
            doc.save(function (err, doc) {
                if (err) {
                    return next(err);
                }
                res.send(doc);
            });
        } else {
            doc.projects = req.body.hours;
            doc.save(function (err, doc) {
                if (err) {
                    return next(err);
                }
                res.send(doc);
            });
        }
    });
};