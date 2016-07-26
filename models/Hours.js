var mongoose = require('mongoose');
var moment = require('moment');

var hoursSchema = new mongoose.Schema({
    userId: String,
    week: Number,
    year: Number,
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
    year: 1
}, {
    unique: true
});

/**
 * Ensure week and year attributes
 */
hoursSchema.pre('save', function (next) {    
    var hours = this;
    if (hours.isNew) {
        hours.week = moment().isoWeek();
        hours.year = moment().year();
        next();
    }
});

var Hours = mongoose.model('Hours', hoursSchema);

module.exports = Hours;

