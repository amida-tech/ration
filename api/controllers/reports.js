'use strict';

var _ = require('lodash');
var async = require('async');
var User = require('../../models/User');
var Hours = require('../../models/Hours');
var weeksSinceEpoch = require('../../lib/util').weeksSinceEpoch;

/**
 * Takes flat layout and returns data in by project format.
 */
var formatHoursByPerson = function (input) {

    var outputData = [];
    var groupedData = _.groupBy(input, 'userId');
    _.forEach(groupedData, function (value, key) {

        var tmpUserObj = {
            userId: key,
            data: [],
            projects: []
        };

        var weeklyGroupings = _.groupBy(value, 'week');
        var tmpArray = [];

        _.forEach(weeklyGroupings, function (value, key) {

            var tmpObj = {
                week: key,
                entries: value
            };
            tmpArray.push(tmpObj);

            _.forEach(value, function (value) {
                tmpUserObj.projects.push(value.name);
            });

        });

        tmpUserObj.data = _.sortBy(tmpArray, 'week');
        tmpUserObj.projects = _.uniq(tmpUserObj.projects);
        outputData.push(tmpUserObj);
    });
    return outputData;
}

/**
 * Takes flat layout and returns data in by project format.
 */
var formatHoursByProject = function (input) {

    var outputData = [];
    var groupedData = _.groupBy(input, 'name');
    _.forEach(groupedData, function (value, key) {

        var tmpProjectObj = {
            name: key,
            data: [],
            people: []
        };

        var weeklyGroupings = _.groupBy(value, 'week');
        var tmpArray = [];

        _.forEach(weeklyGroupings, function (value, key) {
            var tmpObj = {
                week: key,
                entries: value
            };
            tmpArray.push(tmpObj);

            _.forEach(value, function (value) {

                var tmpUser = {
                    userId: value.userId,
                    userEmail: value.userEmail,
                    userProfile: value.userProfile
                };

                tmpProjectObj.people.push(tmpUser);

            });

        });

        tmpProjectObj.data = tmpArray;
        tmpProjectObj.people = _.uniqBy(tmpProjectObj.people, 'userId');
        outputData.push(tmpProjectObj);

    });
    return outputData;
}

/**
 * GET /reports
 * Reports dashboard.
 */
exports.reports = function (req, res, next) {
    res.render('reports/reports', {
        title: 'Reports'
    });
};

/**
 * GET /reports/byperson
 * Builds the reports by person.
 */
exports.byPerson = function (req, res, next) {

    // retrieve hours in flat layout.
    Hours.findFlattened(0, function (err, docs) {
        if (err) return next(err);

        // reformat into report structure
        var outputData = formatHoursByPerson(docs);

        var hours = [];

        // add user info
        async.eachOfSeries(outputData, function (value, key, cb) {
            // look up related user to ensure they are active
            User.findById(value.userId, function (err, user) {
                if (err) {
                    return cb(err);
                } else if (user === null) {
                    return cb();
                } else if (user.inactive) {
                    return cb();
                }

                // append profile and email
                value.userProfile = user.profile;
                value.userEmail = user.email;
                hours.push(value);
                cb();
            });
        }, function (err) {
            if (err) return next(err);

            res.render('reports/reports/person', {
                title: 'Hours by Person',
                hours: hours
            });
        });
    });

};

/**
 * GET /reports/byproject
 * Builds the reports by project.
 */
exports.byProject = function (req, res, next) {

    // retrieve hours in flat layout 
    Hours.findFlattened(0, function (err, docs) {
        if (err) return next(err);

        var hours = [];

        // add user info
        async.eachOfSeries(docs, function (value, key, cb) {
            // look up related user to ensure they are active
            User.findById(value.userId, function (err, user) {
                if (err) {
                    return cb(err);
                } else if (user === null) {
                    return cb();
                } else if (user.inactive) {
                    return cb();
                }

                // append profile and email
                value.userProfile = user.profile;
                value.userEmail = user.email;
                hours.push(value);
                cb();
            });
        }, function (err) {
            if (err) return next(err);

            // reformat into report structure
            var outputData = formatHoursByProject(hours);

            res.render('reports/reports/project', {
                title: 'Hours by Project',
                hours: outputData
            });
        });
    });

};