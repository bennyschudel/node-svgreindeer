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
	var config = this.config = _.merge(
		{
			input_dir  : 'svg/',
			output_dir : '_build/',
			scale      : 1,
			style      : null,
			verbose    : true,
		},
		this._loadConfig(),
		config_
	);

		// normalize paths
	_.each(['input_dir', 'output_dir'], function(key) {
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

	var p = utils.globFiles(config.input_dir+'/**/*.svg')
		.then(function(files) {
			log( '' );
			log( ('SvgReindeer Report').blue.underline );
			log( '' );
			log( '  '+moment().format('LLL'));
			log( '  '+config.input_dir+' → '+config.output_dir );
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

SvgReindeer.prototype._convert = function(files) {
	var _this  = this;
	var config = this.config;

	var p = Q();

	var rapport = function(item) {
		if (!item) { return; }

		var p = utils.fileStats( path.join(config.output_dir, item.dest_file) )
			.then(function(stats) {
				item['file_size'] = filesize(stats.size);

				log( ('  ✔ '+item.src_file).cyan+(' ('+swatch.lap('main')+' s)').grey );
				log( ('     → '+item.dest_file).green+(' ('+item.file_size+')').grey );
			});

		return p;
	};

	_.each(files, function (src_file) {
		var rel_dir   = _this._removeBaseDir(src_file, config.input_dir);
		var dest_file = path.join(config.output_dir, rel_dir).replace(/\.svg$/, '.png');

		p = p.then(rapport)
			.then(function() {
				return _this._convertFile(src_file, dest_file);
			});
	});

	return p.then(rapport);
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
				src_file  : _this._removeBaseDir(src_file, config.input_dir),
				dest_file : _this._removeBaseDir(dest_file, config.output_dir)
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
