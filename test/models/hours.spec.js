var chai = require('chai');
var should = chai.should();
var Hours = require('../../models/Hours');

describe('Hours Model', function() {
  it('should create a new hours', function(done) {
    var hours = new Hours({
      userId: 'user123',
      userName: 'User',
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

  it('should not create an hours with the unique userId', function(done) {
    var hours = new Hours({
      userId: 'user123',
      userName: 'User',
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

  it('should find hours by userId', function(done) {
    Hours.findOne({ userId: 'user123' }, function(err, hours) {
      if (err) return done(err);
      hours.userId.should.equal('user123');
      done();
    });
  });

  it('should delete hours', function(done) {
    Hours.remove({ userId: 'user123' }, function(err) {
      if (err) return done(err);
      done();
    });
  });
});
