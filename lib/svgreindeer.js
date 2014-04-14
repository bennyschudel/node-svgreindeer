"use strict";

var fs   = require('fs');
var path = require('path');

var Q        = require('q');
var _        = require('lodash');
var yaml     = require('js-yaml');
var colors   = require('colors');
var glob     = require('glob');
var filesize = require('filesize');
var moment   = require('moment');

var io_capture = require('./io_capture');
var utils      = require('./utils');
var swatch     = require('./swatch');
var converter  = require('./converter');

var log = console.log;


function SvgReindeer(config_) {
	var _this = this;

	var config = this.config = _.merge(
		{
			input_src  : 'svg/**/*.svg',
			output_dir : '_build/',
			base_dir   : '',
			scale      : 1,
			style      : null,
			verbose    : true,
		},
		this._loadConfig(),
		config_
	);

		// normalize input_src
	config.input_src = (function(input_src) {
		if (_.isArray(input_src)) {
				// skip if it is an array of files
			if (input_src.length > 1) {
				return input_src;
			}
				// otherwise remove array wrapper of single item
			input_src = input_src[0];
		}

		return _this._normalizeInputSrc(input_src);
	})(config.input_src);

		// normalize paths
	_.each(['output_dir'], function(key) {
		config[key] = path.normalize(config[key]+path.sep);
	});
}

SvgReindeer.prototype.run = function() {
	var _this  = this;
	var config = this.config;

	swatch.start('main');

	var stdout = io_capture().stdout({
		verbose: config.verbose
	});

	var p = Q(config.input_src)
		.then(function(pattern) {
				// return directly if not a glob pattern
			if (_.isArray(pattern)) {
				return pattern;
			}

			return utils.globFiles(pattern);
		})
		.then(function(files) {
			log( '' );
			log( ('SvgReindeer Report').blue.underline );
			log( '' );
			log( '  '+moment().format('LLL'));
			log( '' );

			return files;
		})
		.then(function(files) {
			return _this._convert(files);
		})
		.then(function(data) {
			log( '' );
			log( '  '+('Done — ('+swatch.stop('main')+'s)').blue.underline );
			log( '' );

			return [(stdout()).stripColors, data];
		});

	return p;
};

SvgReindeer.prototype._normalizeInputSrc = function(input_src) {
	if (
		_.isString(input_src) &&
		!(/\.svg$/.test(input_src))
	) {
		input_src = path.normalize(input_src+'/*.svg');
	}

	return input_src;
};

SvgReindeer.prototype._convert = function(files) {
	var _this  = this;
	var config = this.config;

	var p = Q();

	var report = function(item) {
		if (!item) { return; }

		var p = utils.fileStats(item.dest_file)
			.then(function(stats) {
				item['file_size'] = filesize(stats.size);

				log([
					'  ✔ '.cyan,
					(path.dirname(item.src_file)+path.sep).grey,
					path.basename(item.src_file).cyan,
					(' ('+swatch.lap('main')+' s)').grey
				].join(''));
				log([
					'     → '.green,
					(path.dirname(item.dest_file)+path.sep).grey,
					path.basename(item.dest_file).green,
					(' ('+item.file_size+')').grey
				].join(''));
			});

		return p;
	};

	_.each(files, function(src_file) {
		var rel_dir   = _this._removeBaseDir(src_file, config.base_dir);
		var dest_file = path.join(config.output_dir, rel_dir).replace(/\.svg$/, '.png');

		p = p.then(report)
			.then(function() {
				return _this._convertFile(src_file, dest_file);
			});
	});

	return p.then(report);
};

SvgReindeer.prototype._convertFile = function(src_file, dest_file) {
	var _this  = this;
	var config = this.config;

	var options = _.pick(config, ['scale', 'style']);

	try {
			// load folder specific css [FOLDER_NAME].css
		options.style = fs.readFileSync( path.dirname(src_file)+'.css', 'utf-8');
			// load file specific css [FILE_NAME].svg.css
		options.style = fs.readFileSync( src_file+'.css', 'utf-8' );
	} catch(e) {}

	var p = converter(src_file, dest_file, options)
		.then(function () {
			return {
				src_file  : src_file,
				dest_file : dest_file
			};
		});

	return p;
};

SvgReindeer.prototype._loadConfig = function() {
	var files = [
		'./svgreindeer.yml',
		'./.svgreindeer.yml'
	];
	var config;

	_.each(files, function(file) {
		try {
			config = yaml.safeLoad(
				fs.readFileSync(file, 'utf-8')
			);

			return false;
		} catch (e) {}
	});

	return config || {};
};

SvgReindeer.prototype._removeBaseDir = function(file, base_dir) {
	var file_dir = path.dirname( path.normalize(file) ).substr(base_dir.length);
	var file_name = path.basename( path.normalize(file) );

	return (file_name) ? path.join(file_dir, file_name) : file_dir;
};

module.exports = SvgReindeer;
