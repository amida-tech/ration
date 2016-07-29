var chai = require('chai');
var should = chai.should();
var Hours = require('../../models/Hours');
var sinon = require('sinon');

var util = require('../../lib/util');
var archiveHours = util.archiveHours;
var weeksSinceEpoch = util.weeksSinceEpoch;
var clock;

describe('Utility functions:', function () {

    describe('archiveHours', function () {

        before(function (done) {

            clock = sinon.useFakeTimers(new Date(2016, 0, 1).getTime());

            Hours.remove({}, function () {
                var hours = new Hours({
                    userId: 'user123',
                    project: [{
                        name: 'knitting',
                        hours: 40
                    }]
                });
                hours.save(function (err) {
                    if (err) return done(err);
                    // we must save the Hours first, since week and year are created
                    // with a pre-save hook for new objects
                    Hours.findOne({ userId: 'user123' }, function (err, doc) {
                        if (err) return done(err);
                        doc.week = weeksSinceEpoch() - 1;
                        doc.save(function (err) {
                            if (err) return done(err);
                            done();
                        });
                    });
                });
            });
        });

        after(function (done) {
            clock.restore();
            done();
        });

        it('should copy forward last week\'s data', function (done) {
            archiveHours(function (err) {
                if (err) return done(err);
                Hours.findOne({
                    userId: 'user123',
                    week: weeksSinceEpoch()
                }, function (err, doc) {
                    if (err) return done(err);
                    doc.should.exist;
                    done();
                });
            });
        });

    });

});