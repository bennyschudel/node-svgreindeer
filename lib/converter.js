"use strict";

var path = require('path');
var exec = require('child_process').execFile;

var Q         = require('q');
var _         = require('lodash');
var which     = require('which');
var phantomjs = require('phantomjs');

var script_name = path.resolve(__dirname, './converter.phantom.js');
var phantom_cmd = phantomjs.path;

function converter(src_file, dest_file, options_) {
	var d = Q.defer();

	var options = _.merge({
		scale : 1,
		style : 'none'
	}, options_);

	var args = [script_name, src_file, dest_file, options.scale, options.style];

	exec(phantom_cmd, args, function (err, stdout, stderr) {
		if (err) {
			d.reject(err);
		} else if (stdout.length > 0) { // PhantomJS always outputs to stdout.
			d.reject( new Error(stdout.toString().trim()) );
		} else if (stderr.length > 0) { // But hey something else might get to stderr.
			d.reject( new Error(stderr.toString().trim()) );
		}

		d.resolve();
	});

	return d.promise;
}

module.exports = converter;