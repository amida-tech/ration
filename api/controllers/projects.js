'use strict';

var async = require('async');
var Projects = require('../../models/Projects');

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
 * PUT /api/projects
 * Update the projects available in the dropdown.
 */
exports.putProjects = function (req, res, next) {
    Projects.remove({}, function (err) {
        if (err) {
            return next(err);
        }

        var projects = req.body.projects;

        function saveProject(proj, callback) {
            var project = new Projects(proj);
            project.save(project, function (err) {
                if (err) {
                    callback(err);
                } else {
                    callback(null);
                }
            });
        }

        async.each(projects, saveProject, function (err) {
            if (err) {
                console.log(err);
            } else {
                res.sendStatus(200);
            }
        });

    });
};