require('cesium/Source/Widgets/widgets.css');

const ApiDataSource = require('./src/ApiDatasource.js').ApiDataSource;
const getHeatEntities = require('./src/ApiDatasource.js').getHeatEntities;
const getGraphEntities = require('./src/ApiDatasource.js').getGraphEntities;
const Clock = require('cesium/Source/Core/Clock');
const JulianDate = require('cesium/Source/Core/JulianDate');
const ClockRange = require('cesium/Source/Core/ClockRange');
const ClockStep = require('cesium/Source/Core/ClockStep');
const Viewer = require('cesium/Source/Widgets/Viewer/Viewer');
const Cartesian3 = require('cesium/Source/Core/Cartesian3');
const BuildModuleUrl = require('cesium/Source/Core/buildModuleUrl');

BuildModuleUrl.setBaseUrl('./');


// Initialise Cesium Viewer to cesiumContainer element
const viewer = new Viewer('cesiumContainer', {
  vrButton: true,
  scene3DOnly: true,
  clock: new Clock({
    startTime: JulianDate.fromIso8601('2017-04-08'),
    currentTime: JulianDate.fromIso8601('2017-04-08'),
    stopTime: JulianDate.fromIso8601('2017-04-10'),
    clockRange: ClockRange.LOOP_STOP,
    multiplier: 1000,
    clockStep: ClockStep.SYSTEM_CLOCK_MULTIPLIER,
  }),
});
const center = Cartesian3.fromDegrees(-2, 53.5);
viewer.camera.lookAt(center, new Cartesian3(0, 0, 1000000.0));

// Add datasources from api
viewer.dataSources.add(new ApiDataSource(date => `http://192.168.1.131:3000/api/tide/${date}`, getGraphEntities, { color: 'red' }));
viewer.dataSources.add(new ApiDataSource(date => `http://192.168.1.131:3000/api/reading/${date}`, getGraphEntities, {}));
viewer.dataSources.add(new ApiDataSource(date => `http://192.168.1.131:3000/api/levels/${date}`, getHeatEntities));
