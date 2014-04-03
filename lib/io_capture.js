'use strict';

var _ = require('lodash');


function capture(pipe, config_) {

	var config = _.merge({

		verbose : false,
		capture : true,
		cback   : null

	}, config_);

	var old_write = process[pipe].write;
	var buffer    = '';

	process[pipe].write = (function(write) {
		return function(string, encoding, fd) {
			if (config.verbose) {
				write.apply(process[pipe], arguments);
			}
			if (config.capture) {
				buffer += string;
			}
			if (config.cback) {
				config.cback(string, encoding, fd);
			}
		};
	})(process[pipe].write);

	return function() {
		process[pipe].write = old_write;

		return buffer;
	};
}

function stdout(config) {
	return capture('stdout', config);
}

function stderr(config) {
	return capture('stderr', config);
}

function main() {
	return {
		stdout: stdout,
		stderr: stderr,
	};
}

module.exports = main;
