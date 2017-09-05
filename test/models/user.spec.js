var chai = require('chai');
var should = chai.should();
var User = require('../../models/User');

describe('User Model', function () {

    describe('Basic', function () {

        before(function (done) {
            User.remove({}, done);
        });

        after(function (done) {
            User.remove({}, done);
        });

        it('should create a new user', function (done) {
            var user = new User({
                email: 'test@gmail.com',
                password: 'password'
            });
            user.save(function (err) {
                if (err) return done(err);
                done();
            });
        });

        it('should not create a user with the unique email', function (done) {
            var user = new User({
                email: 'test@gmail.com',
                password: 'password'
            });
            user.save(function (err) {
                if (err) err.code.should.equal(11000);
                done();
            });
        });

        it('should find user by email', function (done) {
            User.findOne({
                email: 'test@gmail.com'
            }, function (err, user) {
                if (err) return done(err);
                user.email.should.equal('test@gmail.com');
                done();
            });
        });

        it('should delete a user', function (done) {
            User.remove({
                email: 'test@gmail.com'
            }, function (err) {
                if (err) return done(err);
                done();

            });
        });

    });

    describe('Admin', function () {

        before(function (done) {
            User.remove({}, done);
        });

        after(function (done) {
            User.remove({}, done);
        });

        it('should save an admin user', function (done) {
            var user = new User({
                email: 'test@gmail.com',
                password: 'password',
                roles: ['admin']
            });
            user.save(function (err) {
                if (err) return done(err);
                done();
            });
        });

        it('should find admin user with role', function (done) {
            User.findOne({
                email: 'test@gmail.com'
            }, function (err, user) {
                if (err) return done(err);
                user.roles.should.contain('admin');
                user.email.should.equal('test@gmail.com');
                done();
            });
        });

        it('should delete admin user', function (done) {
            User.remove({
                email: 'test@gmail.com'
            }, function (err) {
                if (err) return done(err);
                done();
            });
        });

        it('should create a non-admin user', function (done) {
            var user = new User({
                email: 'test@gmail.com',
                password: 'password'
            });
            user.save(function (err) {
                user.roles.should.not.contain('admin');
                if (err) return done(err);
                done();
            });
        });

        it('should assing a non-admin user admin privileges', function (done) {
            User.findOne({
                email: 'test@gmail.com'
            }, function (err, user) {
                user.roles.push('admin');
                user.save(function (err) {
                    if (err) return done(err);
                    done();
                });
            });
        });

        it('should find non-admin user with admin role', function (done) {
            User.findOne({
                email: 'test@gmail.com'
            }, function (err, user) {
                if (err) return done(err);
                user.roles.should.contain('admin');
                user.email.should.equal('test@gmail.com');
                done();
            });
        });

    })

});