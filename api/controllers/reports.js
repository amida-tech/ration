'use strict';

var _ = require('lodash');
var async = require('async');
var User = require('../../models/User');
var Hours = require('../../models/Hours');
var Projects = require('../../models/Projects');
var weeksSinceEpoch = require('../../lib/util').weeksSinceEpoch;

/**
 * GET /report
 * Reportings dashboard.
 */

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

        async.eachOfSeries(allData, function (value, key, cb) {
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
        }, function (err) {
            if (err) return next(err);
            res.render('hours/dashboard', {
                title: 'Reports',
                hours: hours
            });
        });
    });
};