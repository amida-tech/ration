var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var Hours = require('../models/Hours');
var weeksSinceEpoch = require('../lib/util').weeksSinceEpoch;

/**
 * CSV download module
 */
var csv = require('express-csv');

// mongoexport --db test --collection traffic --out traffic.json

/**
 * GET /api/csv/:num
 * Get all hours for all users from the past number of weeks as a CSV.
 * Each row has the format <userName>,<timestamp>,<project>,<hours>
 */
exports.getAllHoursPastWeeksCSV = function (req, res, next) {
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

        var ret = [];
        _.forEach(docs, function(doc) {
            _.forEach(doc.projects, function(project) {
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
        console.log(ret);
        res.csv(ret);
    });
}
