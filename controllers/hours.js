var _ = require('lodash');
var async = require('async');
var passport = require('passport');
var User = require('../models/User');
var Hours = require('../models/Hours');

/**
 * GET /dashboard
 * Hours dashboard.
 */
exports.dashboard = function (req, res, next) {
    Hours.find({}, function (err, docs) {
        if (err) {
            return next(err);
        }
        res.render('hours/dashboard', {
            title: 'Dashboard',
            hours: docs
        });
    })
};

/**
 * GET /myhours
 * Edit current user hours.
 */
exports.myHours = function(req, res, next) {
  Hours.findOne({userId: req.user.id}, function(err, doc) {
        if (err) {
            return next(err);
        }
        res.render('hours/myhours', {
            title: 'My Hours',
            hours: doc
        });
    });
};

/**
 * GET /api/hours
 * Get all hours.
 */
exports.getAllHours = function(req, res, next) {
    
    Hours.find({}, function(err, docs) {
        if (err) {
            return next(err);
        } 
        res.send(docs);
    });
    
};

/**
 * GET /api/hours/me
 * Get all hours for a specific user.
 */
exports.getHours = function(req, res, next) {
    Hours.findOne({userId: req.user.id}, function(err, doc) {
        if (err) {
            return next(err);
        }
        res.send(doc);
    });
}

/**
 * PUT /api/hours/me
 * Update an hours entry for a user.
 */
exports.putHours = function(req, res, next) {  
    Hours.findOne({userId: req.user.id}, function(err, doc) {
        if (err) {
            return next(err);
        }
        doc.projects = req.body.hours;
        doc.save(function(err, doc) {
            if (err) {
                return next(err);
            }
            res.send(doc);
        })
    })
}