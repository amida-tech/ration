// Generated on 2016-02-05 using generator-angular-fullstack 3.3.0
/* globals require,process,console,module,setTimeout */
'use strict';

module.exports = function (grunt) {

    // Load grunt tasks automatically, when needed
    require('jit-grunt')(grunt, {
        express: 'grunt-express-server',
        mochaTest: 'grunt-mocha-test',
        watch: 'grunt-contrib-watch'
    });

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Define the configuration for all the tasks
    grunt.initConfig({

        // Project settings
        pkg: grunt.file.readJSON('package.json'),
        express: {
            options: {
                port: process.env.RATION_PORT || 3000
            }
        },
        open: {
            server: {
                url: 'http://localhost:<%= express.options.port %>'
            }
        },

        // Make sure code styles are up to par and there are no obvious mistakes
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            main: {
                files: {
                    src: [
                        './{api,config,models}/**/*.js',
                        'app.js',
                        'routes.js'
                    ]
                }
            }
        },

        jscs: {
            options: {
                config: ".jscsrc"
            },
            main: {
                files: {
                    src: [
                        './{config,controllers,models}/**/*.js',
                        'app.js',
                        'routes.js'
                    ]
                }
            }
        },

        jsbeautifier: {
            options: {
                config: '.jsbeautifyrc'
            },
            main: {
                files: {
                    src: [
                        './{config,controllers,models}/**/*.js',
                        'app.js',
                        'routes.js'
                    ]
                }
            }
        },

        mochaTest: {
            options: {
                reporter: 'spec',
                timeout: 7500 // set default mocha spec timeout
            },
            test: {
                src: ['test/**/*.spec.js']
            }
        },

        watch: {
            files: ['./{api,models,test}/**/*.js', 'lib.js', 'app.js', 'routes.js'],
            tasks: ['default']
        }
    });

    grunt.registerTask('test', [
        'mochaTest'
    ]);

    grunt.registerTask('default', [
        'jsbeautifier',
        'jshint',
        'jscs',
        'test'
    ]);
};