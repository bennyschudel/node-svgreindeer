"use strict";
/*global phantom: false*/

// ---
// This library converts a SVG into a PNG file.
// ---
// More or less the svg2png node module written by @domenic
// ---

var webpage = require("webpage");

if (phantom.args.length !== 4) {
	console.error("Usage: converter.js source dest scale style");
	phantom.exit();
} else {
	convert(phantom.args[0], phantom.args[1], Number(phantom.args[2]), phantom.args[3]);
}

function convert(source, dest, scale, style) {
	var page = webpage.create();

	page.open(source, function (status) {
		if (status !== "success") {
			console.error("Unable to load the source file.");
			phantom.exit();
			return;
		}

		if (style !== 'none') {
			injectStyle(page, style);
		}

		var dimensions = getSvgDimensions(page);
		page.viewportSize = {
			width  : Math.round(dimensions.width * scale),
			height : Math.round(dimensions.height * scale)
		};
		if (!dimensions.usesViewBox) {
			page.zoomFactor = scale;
		}

		setTimeout(function () {
			page.render(dest);
			phantom.exit();
		}, 0);
	});
}

function injectStyle(page, style) {
	return page.evaluate(function (style) {

		var el = document.documentElement;

		var style_el = document.createElementNS('http://www.w3.org/2000/svg', 'style');
		style_el.textContent = style;

		el.appendChild(style_el);

	}, style);
}

function getSvgDimensions(page) {
	return page.evaluate(function () {
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
	});
}
