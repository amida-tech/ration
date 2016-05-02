var _ = require('lodash');
var async = require('async');
var passport = require('passport');
var User = require('../models/User');
var Hours = require('../models/Hours');

/**
 * GET /dashboard
 * Hours dashboard.
 */
exports.dashboard = function(req, res) {
  res.render('hours/dashboard', {
    title: 'Dashboard'
  });
};

/**
 * GET /myhours
 * Edit current user hours.
 */
exports.myhours = function(req, res) {
  res.render('hours/myhours', {
    title: 'My Hours'
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
    req.assert('hours', 'Request body must have an hours object').notEmpty();
    
    var errors = req.validationErrors();
    
    if (errors) {
        return next(errors);
    }
    
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