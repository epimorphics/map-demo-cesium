"use strict"

var CesiumHeatmap = require('../dist/CesiumHeatmap.js')();

function APIHeatmap(viewer) {
  this.heatmap = CesiumHeatmap.create(viewer, {north: 57, east: 2, south: 48, west: -6});
  return this;
}

APIHeatmap.prototype.setData = function (min, max, data) {
  this.heatmap.setData(min, max, data);
}

APIHeatmap.prototype.onTick = function (date) {
  var data = [{x: 0, y: 52, value: 1}];
  this.heatmap.setWGS84Data(0, 1, data);
  /*
  var start = moment(time.toString());
  var quaters = Math.round(start.minutes() / 15);
  var datestr = start.set('minutes', quaters * 15).format('YYYY-MM-DD/HH-mm');
  if (this.currentUrl !== datestr) {
    this.currentUrl = datestr;
    return this.loadUrl(`http://192.168.1.131:3000/api/globe/${datestr}`)
      .then(() => true);
  }
  return true;
  */
}

module.exports = APIHeatmap;
