'use strict';

var fs    = require('fs');

var glob   = require('glob');
var q      = require('q');
var mkdirp = require('mkdirp');


function Utils() {}

Utils.prototype.readFile = function(file) {
	return q.nfcall(fs.readFile, file, 'utf8');
};

Utils.prototype.writeFile = function(file, data) {
	return q.nfcall(fs.writeFile, file, data);
};

Utils.prototype.fileStats = function(file) {
	return q.nfcall(fs.stat, file);
};

Utils.prototype.createDir = function(dir) {
	return q.nfcall(mkdirp, dir);
};

Utils.prototype.globFiles = function(pattern, options) {
	return q.nfcall(glob, pattern, options);
};


module.exports = new Utils();
