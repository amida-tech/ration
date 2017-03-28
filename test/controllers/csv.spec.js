var chai = require('chai');
var should = chai.should();
const app = require('../../app.js');
const api = require('supertest').agent(app);

const User = require('../../models/User');
const Hours = require('../../models/Hours');

var tmpAdminUserId;

const tmpAdminUser = {
    email: 'admin@fake.com',
    password: 'asdf'
};

const hours1 = [{
    name: 'test1',
    hours: 10
}, {
    name: 'test2',
    hours: 20
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

describe('CSV Controller:', function () {

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

    it('retrieve CSV with correct hours and percentages', function(done) {
        api.get('/api/csv/report').end(function(err, res) {
            console.log(res.text);
            (res.text).should.contain('.33');
            (res.text).should.contain('.67');
            done(err);
        });
    });
});