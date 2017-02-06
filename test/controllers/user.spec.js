const chai = require('chai');
const should = chai.should();
const app = require('../../app.js');
const api = require('supertest')(app);

describe.only('Admin Testing', function () {

    it('should not allow access if not logged in', function (done) {
        api
            .post('/account/admin')
            .expect(302, done);
    });

});