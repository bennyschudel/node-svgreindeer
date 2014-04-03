"use strict";

// This library converts a SVG into a PNG file.
// ---
// Based on the svg2png node module written by @domenic
// ---

var Q       = require('q');
var _       = require('lodash');
var phantom = require('node-phantom-simple');


function Convertor() {}

Convertor.prototype.convert = function(src_file, dest_file, options_) {
	var options = _.merge({
		scale : 1,
		style : null
	}, options_);

	var _this    = this;
	var deferred = Q.defer();

	phantom.create(function (err, ph) {
		return ph.createPage(function (err, page) {
			return page.open(src_file, function (err, status) {

				if (status !== "success") {
					ph.exit();
					deferred.reject(new Error("Unable to load the source file."));
				}

				var p = Q();

				if (options.style) {
					p = p.then(function() {
						return _this._injectStyle(page, options.style);
					});
				}

				p.then(function(foo) {
					return _this._getSvgDimensions(page);
				})
				.then(function(dimensions) {
					var scale = options.scale;
					var ps = [];

					ps.push( Q.nfcall(page.set, 'viewportSize', {
						width  : Math.round(dimensions.width * scale),
						height : Math.round(dimensions.height * scale)
					}) );

					if (!dimensions.uses_viewbox) {
						ps.push( Q.nfcall(page.set, 'zoomFactor', scale) );
					}

					return Q.all(ps);
				})
				.then(function() {
					page.render(dest_file, function() {
						ph.exit();

						deferred.resolve();
					});
				});

			});
		});
	});

	return deferred.promise;
};

Convertor.prototype._injectStyle = function(page, style) {
	var deferred = Q.defer();

	page.evaluate(function (style) {

		var el = document.documentElement;

		var style_el = document.createElementNS('http://www.w3.org/2000/svg', 'style');
		style_el.textContent = style;

		el.appendChild(style_el);

	}, deferred.makeNodeResolver(), style);

	return deferred.promise;
};

Convertor.prototype._getSvgDimensions = function(page) {
	var deferred = Q.defer();

	page.evaluate(function () {
		var el = document.documentElement;
		var bbox = el.getBBox();

		var width  = parseFloat(el.getAttribute("width"));
		var height = parseFloat(el.getAttribute("height"));
		var viewbox_width  = el.viewBox.animVal.width;
		var viewbox_height = el.viewBox.animVal.height;
		var uses_viewbox   = viewbox_width && viewbox_height;

		if (uses_viewbox) {
			if (width && !height) {
				height = width * viewbox_height / viewbox_width;
			}
			if (height && !width) {
				width = height * viewbox_width / viewbox_height;
			}
			if (!width && !height) {
				width = viewbox_width;
				height = viewbox_height;
			}
		}

		if (!width) {
			width = bbox.width + bbox.x;
		}
		if (!height) {
			height = bbox.height + bbox.y;
		}

		return {
			width  : width,
			height : height,
			uses_viewbox : uses_viewbox
		};
	}, deferred.makeNodeResolver());

	return deferred.promise;
};

module.exports = Convertor;