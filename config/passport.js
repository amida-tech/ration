var _ = require('lodash');
var passport = require('passport');
var request = require('request');
var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var OpenIDStrategy = require('passport-openid').Strategy;
var OAuthStrategy = require('passport-oauth').OAuthStrategy;
var OAuth2Strategy = require('passport-oauth').OAuth2Strategy;

var User = require('../models/User');
var Hours = require('../models/Hours');

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

/**
 * Sign in using Email and Password.
 */
passport.use(new LocalStrategy({
    usernameField: 'email'
}, function (email, password, done) {
    User.findOne({
        email: email.toLowerCase()
    }, function (err, user) {
        if (!user) {
            return done(null, false, {
                msg: 'Email ' + email + ' not found.'
            });
        }
        user.comparePassword(password, function (err, isMatch) {
            if (isMatch) {
                return done(null, user);
            } else {
                return done(null, false, {
                    msg: 'Invalid email or password.'
                });
            }
        });
    });
}));

/**
 * OAuth Strategy Overview
 *
 * - User is already logged in.
 *   - Check if there is an existing account with a provider id.
 *     - If there is, return an error message. (Account merging not supported)
 *     - Else link new OAuth account with currently logged-in user.
 * - User is not logged in.
 *   - Check if it's a returning user.
 *     - If returning user, sign in and we are done.
 *     - Else check if there is an existing account with user's email.
 *       - If there is, return an error message.
 *       - Else create a new account.
 */

/**
 * Sign in with Google.
 */
// TODO simplify this function for a google-only use case
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK,
    passReqToCallback: true
}, function (req, accessToken, refreshToken, profile, done) {
    // Check for allowed domain
    if (profile._json.domain !== process.env.GOOGLE_DOMAIN) {
        req.flash('errors', {
            msg: 'Invalid host domain'
        });
        return done();
    }
    if (req.user) {
        User.findOne({
            google: profile.id
        }, function (err, existingUser) {
            if (existingUser) {
                req.flash('errors', {
                    msg: 'There is already a Google account that belongs to you. Sign in with that account or delete it, then link it with your current account.'
                });
                done(err);
            } else {
                User.findById(req.user.id, function (err, user) {
                    user.google = profile.id;
                    user.tokens.push({
                        kind: 'google',
                        accessToken: accessToken
                    });
                    user.profile.name = user.profile.name || profile.displayName;
                    user.profile.gender = user.profile.gender || profile._json.gender;
                    user.profile.picture = user.profile.picture || profile._json.image.url;
                    user.save(function (err) {
                        req.flash('info', {
                            msg: 'Google account has been linked.'
                        });
                        done(err, user);
                    });
                });
            }
        });
    } else {
        User.findOne({
            google: profile.id
        }, function (err, existingUser) {
            if (existingUser) {
                if (existingUser.inactive) {
                    req.flash('errors', {
                        msg: 'User ' + existingUser.email + ' has been marked inactive.'
                    });
                    return done(err);
                }
                return done(null, existingUser);
            }
            User.findOne({
                email: profile.emails[0].value
            }, function (err, existingEmailUser) {
                if (existingEmailUser) {
                    req.flash('errors', {
                        msg: 'There is already an account using this email address. Sign in to that account and link it with Google manually from Account Settings.'
                    });
                    done(err);
                } else {
                    var user = new User();
                    user.email = profile.emails[0].value;
                    user.google = profile.id;
                    user.tokens.push({
                        kind: 'google',
                        accessToken: accessToken
                    });
                    user.profile.name = profile.displayName;
                    user.profile.gender = profile._json.gender;
                    user.profile.picture = profile._json.image.url;
                    user.save(function (err, newUser) {
                        // Create an Hours document for a new Google user
                        var hours = new Hours();
                        var name = newUser.profile.name;
                        hours.userId = newUser._id;
                        hours.userName = name;
                        hours.save(function (err) {
                            done(err, user);
                        });
                    });
                }
            });
        });
    }
}));

/**
 * Login Required middleware.
 */
exports.isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
};

/**
 * Role Required middleware.
 */
exports.needsRole = function (role) {
    return function (req, res, next) {
        if (req.user) {
            if (req.user.roles.indexOf(role) > -1) {
                return next();
            }
        }
        res.sendStatus(401);
    }
}

/**
 * Authorization Required middleware for tokens..
 */
exports.isAuthorized = function (req, res, next) {
    var provider = req.path.split('/').slice(-1)[0];

    if (_.find(req.user.tokens, {
            kind: provider
        })) {
        next();
    } else {
        res.redirect('/auth/' + provider);
    }
};
