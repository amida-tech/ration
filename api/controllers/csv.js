'use strict';

var _ = require('lodash');
var Hours = require('../../models/Hours');
var weeksSinceEpoch = require('../../lib/util').weeksSinceEpoch;
var dateFromEpoch = require('../../lib/util').dateFromEpoch;

/**
 * CSV download module
 */
require('express-csv');

exports.getReportPastWeekCSV = function (req, res, next) {
    Hours.findWithTotalHours(function(err, docs, totalHours) {
        if (err) return next(err);

        var ret = [];

        // record data and calculate percentages
        _.forEach(docs, function (doc) {
            _.forEach(doc.projects, function (project) {
                var date = dateFromEpoch(doc.week);
                ret.push([
                    doc.userName,
                    date,
                    project.name,
                    project.hours,
                    (project.hours/totalHours[doc.userId]).toFixed(2)
                ]);
            });
        });

        res.set('Content-Disposition', 'attachment; filename="report.csv"');
        res.csv(ret);
    });
};

exports.getProjectReportPastWeekCSV = function (req, res, next) {
    Hours.findWithTotalHours(function(err, docs, totalHours) {
        if (err) return next(err);

        var ret = [];

        // record data and calculate percentages
        _.forEach(docs, function (doc) {
            _.forEach(doc.projects, function (project) {
                var date = dateFromEpoch(doc.week);
                ret.push([
                    project.name,
                    doc.userName,
                    date,
                    project.hours,
                    (project.hours/totalHours[doc.userId]).toFixed(2)
                ]);
            });
        });

        // sort by project name
        ret.sort((function(i) {
            return function(a, b) {
                return (a[i] === b[i] ? 0 : (a[i] < b[i] ? -1 : 1));
            };
        })(0));

        res.set('Content-Disposition', 'attachment; filename="project.csv"');
        res.csv(ret);
    });
};

/**
 * GET /api/csv/:num
 * Get all hours for all users from the past number of weeks as a CSV.
 * Each row has the format <userName>,<timestamp>,<project>,<hours>
 */
exports.getAllHoursPastWeeksCSV = function (req, res, next) {
    if (req.params.num < 1) {
        return next(new Error('Must request at least one week of data'));
    }

    Hours.find({
        week: {
            $gte: weeksSinceEpoch() - req.params.num
        }
    }, function (err, docs) {
        if (err) return next(err);

        var ret = [];

        _.forEach(docs, function (doc) {
            _.forEach(doc.projects, function (project) {
                var days = (doc.week * 7) + 4;
                var epochTime = days * 8.64e7;
                var date = new Date(epochTime).toISOString().slice(0, 10);
                ret.push([
                    doc.userName,
                    date,
                    project.name,
                    project.hours
                ]);
            });
        });

        res.set('Content-Disposition', 'attachment; filename="hours.csv"');
        res.csv(ret);
    });
};