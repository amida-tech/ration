var chai = require('chai');
var should = chai.should();
var hours = require('../../controllers/hours');
var weeksSinceEpoch = require('../../lib/util').weeksSinceEpoch;

describe('Hours Controller:', function() {

    describe('GET', function() {

        it('should get hours for the logged in user');

        it('should get hours from a specific week for a logged in user');

        it('should get hours from the past X weeks for a logged in user');

        it('should get hours for all users');

        it('should get hours from a specific week for all users');

        it('should get hours from the past X weeks for all users');

    });

    describe('PUT', function() {

        it('should update hours for the current week for the logged in user');

    });

});