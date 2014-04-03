'use strict';

	/*** ——— Lap ——— ***/

function Lap() {
	this._start = null;
	this._stop = null;

	this.start();
}

Lap.prototype.now = function() {
	return (new Date()).getTime();
};

Lap.prototype.start = function() {
	if (!this._start) {
		this._start = this.now();
	}

	return this._start;
};

Lap.prototype.stop = function() {
	if (!this._start) { return -1; }

	if (!this._stop) {
		this._stop = this.now();
	}

	return this.duration();
};

Lap.prototype.duration = function() {
	return ((this._stop || this.now()) - this._start);
};

Lap.prototype.valueOf = Lap.prototype.duration;

	/*** ——— /Lap ——— ***/


	/*** ——— Watch ——— ***/

function Watch(label) {
	this.label = label;
	this.laps = [];

	this._lap = null;

	this.start();
}

var _proto = Watch.prototype;

Watch.prototype.start = function() {
	var lap = this._lap = new Lap();

	this.laps.push(lap);

	return lap.start();
};

Watch.prototype.stop = function() {
	this._lap.stop();

	return this.total();
};

Watch.prototype.lap = function() {
	var duration = this.stop();
	this.start();

	return duration;
};

Watch.prototype.total = function() {
	return this.laps.reduce(function(value, lap) {
		return value + lap;
	}, 0) / 1e3;
};

Watch.prototype.valueOf = Watch.prototype.total;

	/*** ——— /Watch ——— ***/


	/*** ——— Swatch ——— ***/

function Swatch() {
	this.watches = {};
}

Swatch.prototype.watch = function(label) {
	var watches = this.watches;

	if (!(label in watches)) {
		watches[label] = new Watch(label);
	}

	return watches[label];
};

Swatch.prototype.start = function(label) {
	var watch = this.watch(label);

	return watch.start();
};

Swatch.prototype.stop = function(label, remove) {
	var watch = this.watch(label);

	if (remove) {
		this.remove(label);
	}

	return watch.stop();
};

Swatch.prototype.lap = function(label) {
	var watch = this.watch(label);

	return watch.lap();
};

Swatch.prototype.remove = function(label) {
	delete this.watches[label];
};

	/*** ——— /Swatch ——— ***/


module.exports = new Swatch();
