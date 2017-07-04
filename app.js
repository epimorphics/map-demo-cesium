require('cesium/Source/Widgets/widgets.css');

var ApiDataSource = require('./src/ApiDatasource.js').ApiDataSource;
var getHeatEntities = require('./src/ApiDatasource.js').getHeatEntities;
var getGraphEntities = require('./src/ApiDatasource.js').getGraphEntities;
var ApiHeatmap = require('./src/ApiHeatmap.js').ApiHeatmap;
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


//console.log(CesiumHeatmap.create(viewer, {north: 40, east: 50, south: 0, west: 0}));

var cesiumTerrainProviderMeshes = new CesiumTerrainProvider({
    url: 'https://assets.agi.com/stk-terrain/world',
    requestWaterMask: true,
    requestVertexNormals: true
});

//var hm = new APIHeatmap(viewer);
//hm.setData(0, 1, [{x: 1000, y: 500, value: 0.5}]);
/*setInterval(() => {
  hm.onTick(viewer.clock.currentTime);
}, 1000);*/

var center = Cartesian3.fromDegrees(-2, 52.0);
viewer.terrainProvider = cesiumTerrainProviderMeshes;
viewer.camera.lookAt(center, new Cartesian3(0, 0, 1000000.0));
viewer.dataSources.add(new ApiDataSource((date) => `http://192.168.1.131:3000/api/globe/readings/${date}`, getGraphEntities));
viewer.dataSources.add(new ApiDataSource((date) => `http://192.168.1.131:3000/api/globe/levels/${date}`, getHeatEntities));
