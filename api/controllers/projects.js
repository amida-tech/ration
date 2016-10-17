var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var passport = require('passport');
var User = require('../../models/User');
var Hours = require('../../models/Hours');
var weeksSinceEpoch = require('../../lib/util').weeksSinceEpoch;

/**
 * GET /dashboard
 * Hours dashboard.
 */
exports.projects = function (req, res, next) {
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
        _.forOwn(allData, function (value, key) {
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
        });

        res.render('projects/projects', {
            title: 'Projects',
            hours: hours
        });
    });
};