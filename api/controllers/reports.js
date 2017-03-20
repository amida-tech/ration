'use strict';

var _ = require('lodash');
var async = require('async');
var User = require('../../models/User');
var Hours = require('../../models/Hours');
//var Projects = require('../../models/Projects');
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
            res.render('reports/reports', {
                title: 'Reports',
                hours: hours
            });
        });
    });
};

exports.byPerson = function (req, res, next) {
    Hours.find({
        week: {
            $gte: weeksSinceEpoch()
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
            res.render('reports/reports/byperson', {
                title: 'Projects by Employee',
                hours: hours
            });
        });
    });

};

exports.byProject = function (req, res, next) {

    Hours.find({
        week: {
            $gte: weeksSinceEpoch()
        }
    }, function (err, docs) {
        if (err) {
            return next(err);
        }

        //Restructure object by project totals.
        function mapByProject(obj) {
            var newArray = _.forEach(obj.projects, function (proj) {
                proj.userId = obj.userId;
                proj.week = obj.week;
                return proj;
            });
            return newArray;

        }

        var mappedData = _.flatMap(docs, mapByProject);
        var hours = [];

        //Hours object is not storing the project id, so I have to take what is there.
        async.eachOfSeries(mappedData, function (value, key, cb) {
            User.findById(value.userId, function (err, user) {
                if (err) {
                    return cb(err);
                } else if (user === null) {
                    return cb();
                } else if (user.inactive) {
                    return cb();
                }
                //Append profile and email.
                value.userProfile = user.profile;
                value.userEmail = user.email;
                hours.push(value);
                cb();
            });
        }, function (err) {
            if (err) return next(err);
            //Group projects after member information appended.
            var groupedData = _.groupBy(mappedData, 'name');
            res.render('reports/reports/byperson', {
                title: 'Projects by Employee',
                hours: groupedData
            });
        });
        //lean() returns pojo.
    }).lean();

};