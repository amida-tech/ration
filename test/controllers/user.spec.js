const chai = require('chai');
const should = chai.should();
const app = require('../../app.js');
const api = require('supertest').agent(app);
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

const activeUser = {
    email: 'active@active.com',
    password: 'asdf',
};

//Remove users and establish root admin user.
before(function (done) {
    User.remove({
        email: tmpUser.email
    }, function (err) {
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
            var tmpActiveUser = new User({
                email: activeUser.email,
                password: activeUser.password
            });
            user.save(function (err) {
                tmpActiveUser.save(function (err) {
                    done(err);
                });
            });
        });
    });
});

//Remove all users when done.
after(function (done) {
    User.remove({}, function (err) {
        done(err);
    });
});

describe('Deactivation testing', function () {

    it('should login admin user', function (done) {
        api.post('/login').send(tmpAdminUser).end(function (err, res) {
            (res.text).should.not.contain('login');
            done(err);
        });
    });

    it('deactivates a user', function (done) {
        api.post('/api/account/deactivate').send(activeUser).expect(200).end(function (err, res) {
            done(err);
        });
    });

    it('ensures that user has been deactivated', function (done) {
        User.findOne({
            email: activeUser.email
        }, function (err, user) {
            (user.inactive).should.equal(true);
            done(err);
        });
    });

    it('ensures deactivated user cannot login', function (done) {
        api.post('/login').send(activeUser).end(function (err, res) {
            (res.text).should.contain('login');
            done(err);
        });

    });

});

describe('Delegation testing', function () {

    describe('admin delegates to non-existent user', function () {

        it('should login admin user', function (done) {
            api.post('/login').send(tmpAdminUser).end(function (err, res) {
                (res.text).should.not.contain('login');
                done(err);
            });
        });

        it('should fail on non existent user', function (done) {

            var tmpRoleUser = {
                email: 'badmojo@nope.no',
                roles: ['admin']
            };

            api.post('/api/account/roles').send(tmpRoleUser).expect(404).end(function (err, res) {
                done(err);
            });
        });

        it('should fail on empty email', function (done) {

            var tmpRoleUser = {
                email: '',
                roles: ['admin']
            };

            api.post('/api/account/roles').send(tmpRoleUser).expect(400).end(function (err, res) {
                done(err);
            });
        });

        it('should log out of admin user', function (done) {
            api.get('/logout').end(function (err, res) {
                (res.text).should.contain('Found. Redirecting to /');
                done(err);
            });
        });

    });

    describe('non-admin registers and cannot delegate', function () {

        it('should register user', function (done) {
            //Register endpoint returns a 302 until refactored.
            api.post('/signup').send(tmpUser).expect(302).end(function (err, res) {
                done(err);
            });
        });

        it('should login new user', function (done) {
            api.post('/login').send(tmpUser).end(function (err, res) {
                (res.text).should.not.contain('login');
                done(err);
            });
        });

        it('should get unauthorized error on self-delegation', function (done) {

            var tmpRoleUser = {
                email: tmpUser.email,
                roles: ['admin']
            };

            api.post('/api/account/roles').send(tmpRoleUser).expect(401).end(function (err, res) {
                done(err);
            });
        });

        it('should log out of admin user', function (done) {
            api.get('/logout').end(function (err, res) {
                (res.text).should.contain('Found. Redirecting to /');
                done(err);
            });
        });

    });

    describe('admin delegates to non-existent roles', function () {

        it('should login admin user', function (done) {
            api.post('/login').send(tmpAdminUser).end(function (err, res) {
                (res.text).should.not.contain('login');
                done(err);
            });
        });

        it('should assign user to no roles', function (done) {

            var tmpRoleUser = {
                email: tmpUser.email,
                roles: ['aristocrat']
            };

            api.post('/api/account/roles').send(tmpRoleUser).expect(200).end(function (err, res) {
                done(err);
            });
        });

        it('should log out of admin user', function (done) {
            api.get('/logout').end(function (err, res) {
                (res.text).should.contain('Found. Redirecting to /');
                done(err);
            });
        });

        it('should log in as non-admin (now admin) user', function (done) {
            api.post('/login').send(tmpUser).end(function (err, res) {
                (res.text).should.not.contain('login');
                done(err);
            });
        });

        it('non-admin (now admin) user should be admin', function (done) {
            api.get('/api/account').end(function (err, res) {
                (res.body.roles).should.be.empty;
                done(err);
            });
        });

        it('should log out of admin user', function (done) {
            api.get('/logout').end(function (err, res) {
                (res.text).should.contain('Found. Redirecting to /');
                done(err);
            });
        });

    });

    describe('admin delegates to non-admin', function () {

        it('should not allow access if not logged in', function (done) {
            api.post('/api/account/roles').end(function (err, res) {
                (res.text).should.contain('login');
                done(err);
            })
        });

        it('should login admin user', function (done) {
            api.post('/login').send(tmpAdminUser).end(function (err, res) {
                (res.text).should.not.contain('login');
                done(err);
            });
        });

        it('should set roles array on non-admin user', function (done) {

            var tmpRoleUser = {
                email: tmpUser.email,
                roles: ['admin']
            };

            api.post('/api/account/roles').send(tmpRoleUser).expect(200).end(function (err, res) {
                done(err);
            });
        });

        it('should log out of admin user', function (done) {
            api.get('/logout').end(function (err, res) {
                (res.text).should.contain('Found. Redirecting to /');
                done(err);
            });
        });

        it('should log in as non-admin (now admin) user', function (done) {
            api.post('/login').send(tmpUser).end(function (err, res) {
                (res.text).should.not.contain('login');
                done(err);
            });
        });

        it('non-admin (now admin) user should be admin', function (done) {
            api.get('/api/account').end(function (err, res) {
                (res.body.roles).should.contain('admin');
                done(err);
            });
        });

        it('should log out of admin user', function (done) {
            api.get('/logout').end(function (err, res) {
                (res.text).should.contain('Found. Redirecting to /');
                done(err);
            });
        });

    });

    describe('admin revokes from another admin', function () {

        it('should login new admin user', function (done) {
            api.post('/login').send(tmpUser).end(function (err, res) {
                (res.text).should.not.contain('login');
                done(err);
            });
        });

        it('should set roles array on original admin user', function (done) {

            var tmpRoleUser = {
                email: tmpAdminUser.email,
                roles: []
            };

            api.post('/api/account/roles').send(tmpRoleUser).expect(200).end(function (err, res) {
                done(err);
            });
        });

        it('should log out of admin user', function (done) {
            api.get('/logout').end(function (err, res) {
                (res.text).should.contain('Found. Redirecting to /');
                done(err);
            });
        });

        it('should log in as non-admin (revoked) user', function (done) {
            api.post('/login').send(tmpAdminUser).end(function (err, res) {
                (res.text).should.not.contain('login');
                done(err);
            });
        });

        it('admin (now revoked) user should not be an admin', function (done) {
            api.get('/api/account').end(function (err, res) {
                (res.body.roles).should.not.contain('admin');
                done(err);
            });
        });

    });

    describe('admin revokes from self', function () {

        it('should login new admin user', function (done) {
            api.post('/login').send(tmpUser).end(function (err, res) {
                (res.text).should.not.contain('login');
                done(err);
            });
        });

        it('should set roles array on new admin user', function (done) {

            var tmpRoleUser = {
                email: tmpUser.email,
                roles: []
            };

            api.post('/api/account/roles').send(tmpRoleUser).expect(200).end(function (err, res) {
                done(err);
            });
        });

        it('attempt at roles set should be unauthorized', function (done) {

            var tmpRoleUser = {
                email: tmpUser.email,
                roles: []
            };

            api.post('/api/account/roles').send(tmpRoleUser).expect(401).end(function (err, res) {
                done(err);
            });
        });

        it('should log out of admin user', function (done) {
            api.get('/logout').end(function (err, res) {
                (res.text).should.contain('Found. Redirecting to /');
                done(err);
            });
        });
    });

});