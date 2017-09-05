var chai = require('chai');
var should = chai.should();
const app = require('../../app.js');
const api = require('supertest').agent(app);

var hours = require('../../api/controllers/hours');
const User = require('../../models/User');
const Hours = require('../../models/Hours');
var weeksSinceEpoch = require('../../lib/util').weeksSinceEpoch;

var tmpAdminUserId;

const tmpAdminUser = {
    email: 'admin@fake.com',
    password: 'asdf'
};

const hours1 = [{
    name: 'test1',
    hours: 10.0
}];

const hours2 = [{
    name: 'test2',
    hours: 20.0
}];

//Remove users and hours and establish root admin user.
before(function (done) {
    Hours.remove({}, function (err) {
        if (err) return done(err);
        User.remove({
            email: tmpAdminUser.email
        }, function (err) {
            if (err) return done(err);
            var user = new User({
                email: tmpAdminUser.email,
                password: tmpAdminUser.password,
                roles: ['admin']
            });
            tmpAdminUserId = user._id;
            user.save(function (err) {
                done(err);
            });
        });
    });
});

//Remove all users and hours when done.
after(function (done) {
    Hours.remove({}, function (err) {
        if (err) return done(err);
        User.remove({
            email: tmpAdminUser.email
        }, function (err) {
            done(err);
        });
    });
});

describe('Hours Controller:', function () {

    describe('GET', function () {

        it('should get hours for the logged in user');

        it('should get hours from a specific week for a logged in user');

        it('should get hours from the past X weeks for a logged in user');

        it('should get hours for all users');

        it('should get hours from a specific week for all users');

        it('should get hours from the past X weeks for all users');

    });

    describe('PUT', function () {

        it('login admin user', function (done) {
            api.post('/login').send(tmpAdminUser).end(function (err, res) {
                (res.text).should.not.contain('login');
                done(err);
            });
        });

        it('update hours for the current week for the logged in user', function (done) {
            api.put('/api/hours/me').send({
                hours: hours1
            }).expect(200).end(function (err, res) {
                done(err);
            });
        });

        it('should update hours for the specified week for the specified user when admin', function (done) {
            const uri = '/api/hours/' + tmpAdminUserId + '/1000';
            api.put(uri).send({
                hours: hours2
            }).expect(200).end(function (err, res) {
                done(err);
            });
        });

        it('logout admin user', function (done) {
            api.get('/logout').end(function (err, res) {
                (res.text).should.contain('Found. Redirecting to /');
                done(err);
            });
        });

    });

});