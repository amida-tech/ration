/**
 * Module dependencies.
 */
var express = require('express');
var compress = require('compression');
var session = require('express-session');
var bodyParser = require('body-parser');
var logger = require('morgan');
var errorHandler = require('errorhandler');
var lusca = require('lusca');
var MongoStore = require('connect-mongo')(session);
var flash = require('express-flash');
var path = require('path');
var mongoose = require('mongoose');
var passport = require('passport');
var expressValidator = require('express-validator');
var sass = require('node-sass-middleware');
var multer = require('multer');
var upload = multer({
    dest: path.join(__dirname, 'uploads')
});

module.exports = function (app) {
    /**
     * Load environment variables from .env file, where API keys and passwords are configured.
     *
     * Default path: .env (You can remove the path argument entirely, after renaming `.env.example` to `.env`)
     */
    if ((process.env.NODE_ENV || 'dev') === 'dev') {
        require('dotenv').load();
    }

    /**
     * Express configuration.
     */
    app.set('port', process.env.PORT || 3000);
    app.set('views', path.normalize(path.join(__dirname, '../views')));
    app.set('view engine', 'jade');
    app.use(compress());
    app.use(sass({
        src: path.normalize(path.join(__dirname, '../public')),
        dest: path.normalize(path.join(__dirname, '../public')),
        sourceMap: true
    }));
    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(expressValidator());
    app.use(session({
        resave: true,
        saveUninitialized: true,
        secret: process.env.SESSION_SECRET,
        store: new MongoStore({
            url: process.env.MONGOLAB_URI || process.env.MONGODB,
            autoReconnect: true
        })
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(flash());
    app.use(lusca.xframe('SAMEORIGIN'));
    app.use(lusca.xssProtection(true));
    app.use(function (req, res, next) {
        res.locals.user = req.user;
        next();
    });
    app.use(function (req, res, next) {
        // After successful login, redirect back to /api, /contact or /
        if (/(api)|(contact)|(^\/$)/i.test(req.path)) {
            req.session.returnTo = req.path;
        }
        next();
    });
    app.use(express.static(path.normalize(path.join(__dirname, '../public')), {
        maxAge: 31557600000
    }));

    /**
     * Error Handler.
     */
    app.use(errorHandler());

}
