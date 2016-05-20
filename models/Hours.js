var mongoose = require('mongoose');

var hoursSchema = new mongoose.Schema({
    userId: {
        type: String,
        unique: true
    },
    userName: String,
    projects: [{
        name: String,
        hours: Number
    }]
})

var Hours = mongoose.model('Hours', hoursSchema);

module.exports = Hours;
