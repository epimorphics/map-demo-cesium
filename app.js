require('cesium/Source/Widgets/widgets.css');

var ApiDataSource = require('./src/ApiDatasource.js').ApiDataSource;
var getHeatEntities = require('./src/ApiDatasource.js').getHeatEntities;
var getGraphEntities = require('./src/ApiDatasource.js').getGraphEntities;
var Clock = require('cesium/Source/Core/Clock');
var Color = require('cesium/Source/Core/Color');
var JulianDate = require('cesium/Source/Core/JulianDate');
var ClockRange = require('cesium/Source/Core/ClockRange');
var ClockStep = require('cesium/Source/Core/ClockStep');
var Viewer = require('cesium/Source/Widgets/Viewer/Viewer');
var CesiumTerrainProvider = require('cesium/Source/Core/CesiumTerrainProvider');
var Cartesian3 = require('cesium/Source/Core/Cartesian3');
var BuildModuleUrl = require('cesium/Source/Core/buildModuleUrl');

BuildModuleUrl.setBaseUrl('./');

var viewer = new Viewer('cesiumContainer', {
  vrButton : true,
  clock : new Clock({
    startTime : JulianDate.fromIso8601("2017-03-01"),
    currentTime : JulianDate.fromIso8601("2017-03-08"),
    stopTime : JulianDate.fromIso8601("2017-05-20"),
    clockRange : ClockRange.LOOP_STOP,
    multiplier: 3800,
    clockStep : ClockStep.SYSTEM_CLOCK_MULTIPLIER
  })
});
var center = Cartesian3.fromDegrees(-2, 53.5);
viewer.camera.lookAt(center, new Cartesian3(0, 0, 1000000.0));

// Add datasources from api
viewer.dataSources.add(new ApiDataSource((date) => `http://192.168.1.131:3000/api/tide/${date}`, getGraphEntities, { color: 'red' }));
viewer.dataSources.add(new ApiDataSource((date) => `http://192.168.1.131:3000/api/reading/${date}`, getGraphEntities, {} ));
viewer.dataSources.add(new ApiDataSource((date) => `http://192.168.1.131:3000/api/levels/${date}`, getHeatEntities));
