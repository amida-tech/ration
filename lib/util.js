var Hours = require('../models/Hours');

var archiveHours = function (callback) {
    Hours.find({ week: weeksSinceEpoch() - 1 }, function (err, docs) {
        docs.forEach(function (doc) {
            var hours = new Hours({
                userId: doc.userId,
                week: weeksSinceEpoch(),
                project: doc.project,
            });
            hours.save(function(err) {
                if (err) return callback(err);
                return callback(null);
            });

        });
    });
};

var weeksSinceEpoch = function () {
    var now = new Date();
    var fullDaysSinceEpoch = Math.floor(now / 8.64e7) - 4;
    var fullWeeksSinceEpoch = Math.floor(fullDaysSinceEpoch / 7);
    return fullWeeksSinceEpoch;
};

module.exports = {
    archiveHours: archiveHours,
    weeksSinceEpoch: weeksSinceEpoch
};