var chai = require('chai');
var should = chai.should();
var Hours = require('../../models/Hours');
var moment = require('moment');

var testWeek = moment().isoWeek();
var testYear = moment().year();

describe('Hours Model', function() {
  
  before(function(done) {
    Hours.remove({}, done);
  });

  it('should create a new hours object', function(done) {
    var hours = new Hours({
      userId: 'user123',
      project: [{
          name: 'knitting',
          hours: 40
      }]
    });
    hours.save(function(err) {
      if (err) return done(err);
      done();
    });
  });

  it('should create correct week and year on hours creation', function(done) {    
    var hours = new Hours({
      userId: 'user456',
      project: [{
          name: 'knitting',
          hours: 40
      }]
    });
    hours.save(function(err, doc) {
      if (err) return done(err);
      doc.week.should.equal(testWeek);
      doc.year.should.equal(testYear);
      done();
    });
  });

  it('should not create an hours with the unique userId in the current week', function(done) {
    var hours = new Hours({
      userId: 'user123',
      project: [{
          name: 'knitting',
          hours: 40
      }]
    });
    hours.save(function(err) {
      if (err) err.code.should.equal(11000);
      done();
    });
  });

  it('should find hours by userId, current week, and current year', function(done) {
    Hours.findOne({ userId: 'user123', week: testWeek, year: testYear }, function(err, hours) {
      if (err) return done(err);
      hours.userId.should.equal('user123');
      done();
    });
  });

  it('should delete hours', function(done) {
    Hours.remove({ userId: 'user123', week: testWeek, year: testYear }, function(err) {
      if (err) return done(err);
      done();
    });
  });

  
});
