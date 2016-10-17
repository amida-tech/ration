var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var passport = require('passport');
var User = require('../../models/User');
var Projects = require('../../models/Projects');
var Hours = require('../../models/Hours');
var weeksSinceEpoch = require('../../lib/util').weeksSinceEpoch;

/**
 * GET /dashboard
 * Projects dashboard.
 */
exports.projects = function (req, res, next) {
    Projects.find({}, function (err, docs) {
        if (err) {
            return next(err);
        }

        res.render('projects/projects', {
            title: 'Projects',
            projects: docs
        });

    });
};

/**
 * GET /api/projects
 * Get all projects in Ration.
 */
exports.getAllProjects = function (req, res, next) {
    Projects.find({}, function (err, docs) {
        if (err) {
            return next(err);
        }
        res.send(docs);
    });
};