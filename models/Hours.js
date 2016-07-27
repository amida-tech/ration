var mongoose = require('mongoose');

// mirrored from util.js to avoid circular reference
var weeksSinceEpoch = function () {
    var now = new Date();
    var fullDaysSinceEpoch = Math.floor(now / 8.64e7) - 4;
    var fullWeeksSinceEpoch = Math.floor(fullDaysSinceEpoch / 7);
    return fullWeeksSinceEpoch;
};

var hoursSchema = new mongoose.Schema({
    userId: String,
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
    week: 1,
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
    if (hours.isNew) {
        hours.week = weeksSinceEpoch();
    }
    next();
});

var Hours = mongoose.model('Hours', hoursSchema);

module.exports = Hours;

