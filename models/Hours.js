var mongoose = require('mongoose');

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
    Date.prototype.getWeek = function () {
        var target = new Date(this.valueOf());
        var dayNr = (this.getDay() + 6) % 7;
        target.setDate(target.getDate() - dayNr + 3);
        var firstThursday = target.valueOf();
        target.setMonth(0, 1);
        if (target.getDay() != 4) {
            target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
        }
        return 1 + Math.ceil((firstThursday - target) / 604800000);
    }
    
    var hours = this;
    if (hours.isNew) {
        var date = new Date();
        hours.week = date.getWeek();
        hours.year = date.getFullYear();
        next();
    }
})

var Hours = mongoose.model('Hours', hoursSchema);

module.exports = Hours;

