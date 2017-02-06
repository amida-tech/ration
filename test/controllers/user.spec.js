const chai = require('chai');
const should = chai.should();
const app = require('../../app.js');
const api = require('supertest').agent(app);

//Needed to manually set admin flag, and back out test user.
const User = require('../../models/User');

const tmpAdminUser = {
    email: 'admin@fake.com',
    password: 'asdf'
};

const tmpUser = {
    email: 'test@fake.com',
    password: 'asdf',
    confirmPassword: 'asdf'
};

//Back out users, and establish root admin user.
before(function (done) {
    User.remove({
        email: tmpUser.email
    }, function (err) {
        User.remove({
            email: tmpAdminUser.email
        }, function (err) {
            if (err) return done(err);
            var user = new User({
                email: tmpAdminUser.email,
                password: tmpAdminUser.password,
                roles: ['admin']
            });
            user.save(function (err) {
                if (err) return done(err);
                done();
            });
        });
    });
});

describe.only('Admin Testing', function () {

    it('should not allow access if not logged in', function (done) {
        api.post('/api/account/roles').end(function (err, res) {
            done();
        })
    });

    it('should register user', function (done) {
        //Register endpoint returns a 302 until refactored.
        api.post('/signup').send(tmpUser).end(function (err, res) {
            if (err) {
                done(err);
            } else {
                done();
            }
        });
    });

    it('login admin user', function (done) {
        api.post('/login').send(tmpAdminUser).end(function (err, res) {
            done();
        });
    });

    it('set roles array on other user', function (done) {

        var tmpRoleUser = {
            email: tmpUser.email,
            roles: ['admin']
        };

        api.post('/api/account/roles').send(tmpRoleUser).expect(200).end(function (err, res) {
            if (err) {
                done(err);
            } else {
                done();
            }
        });
    });

    it('log out of admin user', function (done) {
        api.post('/logout').end(function (err, res) {
            done();
        });
    });

    it('log in as basic user', function (done) {
        api.post('/login').send(tmpUser).end(function (err, res) {
            done();
        });
    });

    it('check account information for admin status', function (done) {
        api.get('/api/account').end(function (err, res) {
            (res.body.roles).should.contain('admin');
            done();
        });
    });

});