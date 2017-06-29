require('cesium/Source/Widgets/widgets.css');
var loadData = require('./src/ApiDatasource.js').loadData;
var BuildModuleUrl = require('cesium/Source/Core/buildModuleUrl');
BuildModuleUrl.setBaseUrl('./');
var Clock = require('cesium/Source/Core/Clock');
var JulianDate = require('cesium/Source/Core/JulianDate');
var ClockRange = require('cesium/Source/Core/ClockRange');
var ClockStep = require('cesium/Source/Core/ClockStep');

var Viewer = require('cesium/Source/Widgets/Viewer/Viewer');
var CesiumTerrainProvider = require('cesium/Source/Core/CesiumTerrainProvider');
var Cartesian3 = require('cesium/Source/Core/Cartesian3');

var viewer = new Viewer('cesiumContainer', {
  vrButton : true,
  clock : new Clock({
    startTime : JulianDate.fromIso8601("2017-03-01"),
    currentTime : JulianDate.fromIso8601("2017-03-01"),
    stopTime : JulianDate.fromIso8601("2017-05-20"),
    clockRange : ClockRange.LOOP_STOP,
    multiplier: 3800,
    clockStep : ClockStep.SYSTEM_CLOCK_MULTIPLIER
  })
});

var cesiumTerrainProviderMeshes = new CesiumTerrainProvider({
    url: 'https://assets.agi.com/stk-terrain/world',
    requestWaterMask: true,
    requestVertexNormals: true
});

var center = Cartesian3.fromDegrees(-2, 52.0);
// viewer.terrainProvider = cesiumTerrainProviderMeshes;
viewer.camera.lookAt(center, new Cartesian3(0, 0, 1000000.0));
viewer.dataSources.add(loadData([
      {date: '2017-03-04', time: '11-00'},
]));
