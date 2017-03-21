'use strict';

var _ = require('lodash');
var async = require('async');
var User = require('../../models/User');
var Hours = require('../../models/Hours');
//var Projects = require('../../models/Projects');
var weeksSinceEpoch = require('../../lib/util').weeksSinceEpoch;

/**
 * Gets hours for an epoch window (optionally), and returns them in flat layout.
 */
var getHours = function (epochSubtractor, callback) {

    //Mapping function, returns flat layout.
    function mapByProject(obj) {
        var newArray = _.forEach(obj.projects, function (proj) {
            proj.userId = obj.userId;
            proj.week = obj.week;
            return proj;
        });
        return newArray;
    }

    if (!epochSubtractor) {
        epochSubtractor = 0;
    }

    Hours.find({
        week: {
            $gte: weeksSinceEpoch() - epochSubtractor
        }
    }, function (err, docs) {
        if (err) {
            return callback(err);
        }

        //Flatten all entries.
        var mappedData = _.flatMap(docs, mapByProject);
        callback(null, mappedData);

        //lean() returns pojo.
    }).lean();
}

/**
 * GET /dashboard
 * Hours dashboard.
 */
exports.dashboard = function (req, res, next) {
    Hours.find({
        week: {
            $gte: weeksSinceEpoch() - 3
        }
    }, function (err, docs) {
        if (err) {
            return next(err);
        }
        var allData = _.groupBy(docs, 'userName');
        var hours = [];

        async.eachOfSeries(allData, function (value, key, cb) {
            // look up related user to ensure they are active
            User.findById(value[0].userId, function (err, user) {
                if (err) {
                    return cb(err);
                } else if (user === null) {
                    return cb();
                } else if (user.inactive) {
                    return cb();
                }
                var temp = {
                    name: key,
                    data: _.sortBy(value, 'week'),
                    projects: []
                };
                _.forEach(value, function (val) {
                    _.forEach(val.projects, function (project) {
                        if (temp.projects.indexOf(project.name) < 0) {
                            temp.projects.push(project.name);
                        }
                    });
                });
                hours.push(temp);
                cb();
            });
        }, function (err) {
            if (err) return next(err);
            res.render('reports/reports', {
                title: 'Reports',
                hours: hours
            });
        });
    });
};

exports.byPerson = function (req, res, next) {
    Hours.find({
        week: {
            $gte: weeksSinceEpoch()
        }
    }, function (err, docs) {
        if (err) {
            return next(err);
        }
        var allData = _.groupBy(docs, 'userName');

        var hours = [];

        async.eachOfSeries(allData, function (value, key, cb) {
            // look up related user to ensure they are active
            User.findById(value[0].userId, function (err, user) {
                if (err) {
                    return cb(err);
                } else if (user === null) {
                    return cb();
                } else if (user.inactive) {
                    return cb();
                }
                var temp = {
                    name: key,
                    data: _.sortBy(value, 'week'),
                    projects: []
                };
                _.forEach(value, function (val) {
                    _.forEach(val.projects, function (project) {
                        if (temp.projects.indexOf(project.name) < 0) {
                            temp.projects.push(project.name);
                        }
                    });
                });
                hours.push(temp);
                cb();
            });
        }, function (err) {

            if (err) return next(err);
            res.render('reports/reports/byperson', {
                title: 'Hours by People',
                hours: hours
            });
        });
    });

};

exports.byProject = function (req, res, next) {

    getHours(0, function (err, docs) {
        if (err) return next(err);

        var hours = [];

        //Hours object is not storing the project id, so I have to take what is there.
        async.eachOfSeries(docs, function (value, key, cb) {
            User.findById(value.userId, function (err, user) {
                if (err) {
                    return cb(err);
                } else if (user === null) {
                    return cb();
                } else if (user.inactive) {
                    return cb();
                }

                //Append profile and email.
                value.userProfile = user.profile;
                value.userEmail = user.email;
                hours.push(value);
                cb();
            });
        }, function (err) {
            if (err) return next(err);

            //Rebuild the flattened entries, grouped by project and week.
            var outputData = [];
            var groupedData = _.groupBy(hours, 'name');
            _.forEach(groupedData, function (value, key) {

                var tmpProjectObj = {
                    name: key,
                    data: [],
                    people: []
                };

                var weeklyGroupings = _.groupBy(value, 'week');
                var tmpArray = [];

                _.forEach(weeklyGroupings, function (value, key) {
                    var tmpObj = {
                        week: key,
                        entries: value
                    };
                    tmpArray.push(tmpObj);

                    _.forEach(value, function (value) {

                        var tmpUser = {
                            userId: value.userId,
                            userEmail: value.userEmail,
                            userProfile: value.userProfile
                        };

                        tmpProjectObj.people.push(tmpUser);

                    });

                });

                tmpProjectObj.data = tmpArray;
                tmpProjectObj.people = _.uniqBy(tmpProjectObj.people, 'userId');
                outputData.push(tmpProjectObj);

            });

            res.render('reports/reports/byproject', {
                title: 'Hours by Project',
                hours: outputData
            });
        });
    });

};