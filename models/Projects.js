'use strict';

var mongoose = require('mongoose');

var projectSchema = new mongoose.Schema({
    projectId: Number,
    name: String
});

/**
 * Multikey index
 */
projectSchema.index({
    projectId: 1,
    name: 1
}, {
    unique: true
});

var Projects = mongoose.model('Projects', projectSchema);

module.exports = Projects;
