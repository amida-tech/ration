'use strict';

var mongoose = require('mongoose');
var _ = require('lodash');

// mirrored from util.js to avoid circular reference
var weeksSinceEpoch = function () {
    var now = new Date();
    var fullDaysSinceEpoch = Math.floor(now / 8.64e7) - 4;
    var fullWeeksSinceEpoch = Math.floor(fullDaysSinceEpoch / 7);
    return fullWeeksSinceEpoch;
};

var hoursSchema = new mongoose.Schema({
    userId: String,
    userName: String,
    week: Number,
    projects: [{
        name: String,
        hours: Number
    }]
});

/**
 * Multikey index
 */
hoursSchema.index({
    userId: 1,
    week: 1
}, {
    unique: true
});

/**
 * Ensure week is present
 * Hours are archived by number of weeks since the Epoch + 4 days
 * This means weeks start on Monday
 */
hoursSchema.pre('save', function (next) {
    var hours = this;
    //if (hours.isNew) {
    if (hours.isNew && (typeof (hours.week) === 'undefined')) {
        hours.week = weeksSinceEpoch();
    }
    next();
});

/**
 * Look up total hours by user for the current week
 * cb - function(err, hoursDocs, totalHoursByUserObj)
 */
hoursSchema.statics.findWithTotalHours = function (cb) {
    this.find({
        week: {
            $gte: weeksSinceEpoch() - 1
        }
    }, function (err, docs) {
        if (err) return cb(err);

        var totalHours = {};

        _.forEach(docs, function (doc) {
            _.forEach(doc.projects, function (project) {
                if (totalHours.hasOwnProperty(doc.userId)) {
                    totalHours[doc.userId] += project.hours;
                } else {
                    totalHours[doc.userId] = project.hours;
                }
            });
        });

        return cb(null, docs, totalHours);
    });
};

var Hours = mongoose.model('Hours', hoursSchema);

module.exports = Hours;
