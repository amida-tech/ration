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

 /**
 * Gets flattened hours with just user, project, and allocation on same level
 * Optionally define how many epochs back from the current epoch (week) you want to retrieve
 * cb - function(err, flattenedData)
 */
hoursSchema.statics.findFlattened = function (epochsBack, cb) {

    //Mapping function, returns flat layout.
    function mapByProject(obj) {
        var newArray = _.forEach(obj.projects, function (proj) {
            proj.userId = obj.userId;
            proj.week = obj.week;
            return proj;
        });
        return newArray;
    }

    //If there isn't a set number of epochs back asked for, default to zero (current epoch).
    if (!epochsBack) {
        epochsBack = 0;
    }

    this.find({
        week: {
            $gte: weeksSinceEpoch() - epochsBack
        }
    }, function (err, docs) {
        if (err) {
            return cb(err);
        }

        //Flatten all entries.
        var mappedData = _.flatMap(docs, mapByProject);
        cb(null, mappedData);

        //lean() returns pojo so you can append information to the returned object.
    }).lean();
};

var Hours = mongoose.model('Hours', hoursSchema);

module.exports = Hours;
