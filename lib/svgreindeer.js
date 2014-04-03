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
var Convertor  = require('./convertor');

var log = console.log;


function SvgReindeer(config_) {
	var config = this.config = _.merge(
		{
			scale   : 1,
			style   : null,
			verbose : true,
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
	var _this = this;

	swatch.start('main');

	var stdout = io_capture().stdout({
		verbose: this.config.verbose
	});

	var p = utils.globFiles(this.config.input_dir+'/**/*.svg')
		.then(function(files) {
			return _this._convert(files);
		})
		.then(function(files) {
			return _this._rapport({
				files: files
			});
		})
		.then(function(data) {
			return [(stdout()).stripColors, data];
		});

	return p;
};

SvgReindeer.prototype._convert = function(files) {
	var _this  = this;
	var config = this.config;

	var ps = [];

	_.each(files, function (src_file) {
		var rel_dir   = _this._removeBaseDir(src_file, config.input_dir);
		var dest_file = path.join(config.output_dir, rel_dir).replace(/\.svg$/, '.png');

		ps.push(
			_this._convertFile(src_file, dest_file)
		);
	});

	return Q.all(ps);
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

	var p = (new Convertor())
		.convert(src_file, dest_file, options)
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

SvgReindeer.prototype._rapport = function(data) {
	var config = this.config;

	var ps = [];

	_.each(data.files, function (item) {
		ps.push( utils.fileStats( path.join(config.output_dir, item.dest_file) ) );
	});

	var p = Q.all(ps)
		.then(function (stats) {
			_.each(stats, function (file_stats, index) {
				data.files[index]['dest_file_size'] = filesize(file_stats.size);
			});
		})
		.then(function () {

			log( '' );
			log( ('SvgReindeer Rapport — ('+swatch.stop('main')+'s)').blue.underline );
			log( '' );
			log( '  '+moment().format('LLL'));
			log( '  '+config.input_dir+' → '+config.output_dir );
			log( '' );
			_.each(data.files, function(item) {
				log( '  '+item.src_file.cyan );
				log( ('    → '+item.dest_file+' ('+item.dest_file_size+')').green );
			});
			log( '' );

			return data;
		});

	return p;
};

module.exports = SvgReindeer;
