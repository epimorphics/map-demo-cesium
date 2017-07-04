const CesiumEvent = require('cesium/Source/Core/Event.js');
const EntityCollection = require('cesium/Source/DataSources/EntityCollection.js')
const EntityCluster = require('cesium/Source/DataSources/EntityCluster.js')
const Cesium = require('cesium/Source/Cesium.js');
const moment = require('moment');

function getGraphEntities(coordinates) {
    var entityArr = []
    for (var i = 0; i < coordinates.length; i += 3) {
        var latitude = coordinates[i];
        var longitude = coordinates[i + 1];
        var height = coordinates[i + 2];

        //Ignore lines of zero height.
        if(height === 0) {
            continue;
        }

        var color = Cesium.Color.fromHsl((0.6 - (height * 0.1)), 1.0, 0.5);
        var surfacePosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, 0);
        var heightPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, height * 150000);

        //WebGL Globe only contains lines, so that's the only graphics we create.
        var polyline = new Cesium.PolylineGraphics();
        polyline.material = new Cesium.ColorMaterialProperty(color);
        polyline.width = new Cesium.ConstantProperty(2);
        polyline.followSurface = new Cesium.ConstantProperty(false);
        polyline.positions = new Cesium.ConstantProperty([surfacePosition, heightPosition]);

        //The polyline instance itself needs to be on an entity.
        var entity = new Cesium.Entity({
            show : true,
            polyline : polyline,
        });

        //Add the entity to the collection.
        //entities.add(entity);
        entityArr.push(entity);
    }
    return entityArr;
}

function getHeatEntities(coordinates) {
  var entityArr = []
  for (var i = 0; i < coordinates.length; i += 3) {
      var latitude = coordinates[i];
      var longitude = coordinates[i + 1];
      var height = coordinates[i + 2];

      //Ignore lines of zero height.
      if(height === 0) {
          continue;
      }

      var ellipse = new Cesium.EllipseGraphics({
            semiMinorAxis : 10000,
            semiMajorAxis : 10000,
            material : Cesium.Color.fromHsl(0.6 * (1.0 - height), 1.0, 0.5, 0.5)
      })

      //The polyline instance itself needs to be on an entity.
      var entity = new Cesium.Entity({
          show : true,
          ellipse : ellipse,
          position : new Cesium.Cartesian3.fromDegrees(longitude, latitude),
      });

      //Add the entity to the collection.
      entityArr.push(entity);
  }
  return entityArr;
}

function ApiDataSource(api, visualisation) {
  this._name = 'dataSource';
  this._changed = new CesiumEvent();
  this._error = new CesiumEvent();
  this._isLoading = false;
  this._loading = new CesiumEvent();
  this._entityCollection = new EntityCollection();
  this._seriesNames = [];
  this._seriesToDisplay = undefined;
  this._heightScale = 150000;
  this._entityCluster = new EntityCluster();
  this.graphVisualisation = visualisation;//getHeatEntities;//getGraphEntities;
  this.update = function (time) {
    var start = moment(time.toString());
    var quaters = Math.round(start.minutes() / 15);
    var datestr = start.set('minutes', quaters * 15).format('YYYY-MM-DD/HH-mm');
    if (this.currentUrl !== datestr) {
      this.currentUrl = datestr;
      //return this.loadUrl(`http://192.168.1.131:3000/api/globe/readings/${datestr}`)
      return this.loadUrl(api(datestr))
       .then(() => true);
    }
    return true;
  };
}

Object.defineProperties(ApiDataSource.prototype, {
  //The below properties must be implemented by all DataSource instances

  /**
   * Gets a human-readable name for this instance.
   * @memberof WebGLGlobeDataSource.prototype
   * @type {String}
   */
  name : {
    get : function() {
      return this._name;
    }
  },
  /**
   * Since WebGL Globe JSON is not time-dynamic, this property is always undefined.
   * @memberof WebGLGlobeDataSource.prototype
   * @type {DataSourceClock}
   */
  clock : {
    value : '2017-06-04',
    writable : true
  },
  /**
   * Gets the collection of Entity instances.
   * @memberof WebGLGlobeDataSource.prototype
   * @type {EntityCollection}
   */
  entities : {
    get : function() {
        return this._entityCollection;
    }
  },
  /**
   * Gets a value indicating if the data source is currently loading data.
   * @memberof WebGLGlobeDataSource.prototype
   * @type {Boolean}
   */
  isLoading : {
    get : function() {
        return this._isLoading;
    }
  },
  /**
   * Gets an event that will be raised when the underlying data changes.
   * @memberof WebGLGlobeDataSource.prototype
   * @type {Event}
   */
  changedEvent : {
    get : function() {
        return this._changed;
    }
  },
  /**
   * Gets an event that will be raised if an error is encountered during
   * processing.
   * @memberof WebGLGlobeDataSource.prototype
   * @type {Event}
   */
  errorEvent : {
    get : function() {
        return this._error;
    }
  },
  /**
   * Gets an event that will be raised when the data source either starts or
   * stops loading.
   * @memberof WebGLGlobeDataSource.prototype
   * @type {Event}
   */
  loadingEvent : {
    get : function() {
        return this._loading;
    }
  },

  //These properties are specific to this DataSource.

  /**
   * Gets the array of series names.
   * @memberof WebGLGlobeDataSource.prototype
   * @type {String[]}
   */
  seriesNames : {
    get : function() {
        return this._seriesNames;
    }
  },
  /**
   * Gets or sets the name of the series to display.  WebGL JSON is designed
   * so that only one series is viewed at a time.  Valid values are defined
   * in the seriesNames property.
   * @memberof WebGLGlobeDataSource.prototype
   * @type {String}
   */
  seriesToDisplay : {
    get : function() {
      return this._seriesToDisplay;
    },
    set : function(value) {
      this._seriesToDisplay = value;

      //Iterate over all entities and set their show property
      //to true only if they are part of the current series.
      var collection = this._entityCollection;
      var entities = collection.values;
      collection.suspendEvents();
      for (var i = 0; i < entities.length; i++) {
        var entity = entities[i];
        entity.show = value === entity.seriesName;
      }
      collection.resumeEvents();
    }
  },
  /**
   * Gets or sets the scale factor applied to the height of each line.
   * @memberof WebGLGlobeDataSource.prototype
   * @type {Number}
   */
  heightScale : {
    get : function() {
      return this._heightScale;
    },
    set : function(value) {
      if (value > 0) {
        console.log('value must be greater than 0');
      }
      this._heightScale = value;
    }
  },
  /**
   * Gets whether or not this data source should be displayed.
   * @memberof WebGLGlobeDataSource.prototype
   * @type {Boolean}
   */
  show : {
    get : function() {
      return this._entityCollection;
    },
    set : function(value) {
      this._entityCollection = value;
    }
  },
  /**
   * Gets or sets the clustering options for this data source. This object can be shared between multiple data sources.
   * @memberof WebGLGlobeDataSource.prototype
   * @type {EntityCluster}
   */
  clustering : {
    get : function() {
      return this._entityCluster;
    },
    set : function(value) {
      if (!Cesium.defined(value)) {
        throw new Cesium.DeveloperError('value must be defined.');
      }
      this._entityCluster = value;
    }
  }
});


/**
 * Asynchronously loads the GeoJSON at the provided url, replacing any existing data.
 * @param {Object} url The url to be processed.
 * @returns {Promise} a promise that will resolve when the GeoJSON is loaded.
 */
ApiDataSource.prototype.loadUrl = function(url) {
    if (!Cesium.defined(url)) {
        throw new Cesium.DeveloperError('url is required.');
    }

    //Create a name based on the url
    var name = Cesium.getFilenameFromUri(url);

    //Set the name if it is different than the current name.
    if (this._name !== name) {
        this._name = name;
        this._changed.raiseEvent(this);
    }

    //Use 'when' to load the URL into a json object
    //and then process is with the `load` function.
    var that = this;
    return Cesium.when(Cesium.loadJson(url), function(json) {
        return that.load(json, url);
    }).otherwise(function(error) {
        //Otherwise will catch any errors or exceptions that occur 
        //during the promise processing. When this happens, 
        //we raise the error event and reject the promise. 
        this._setLoading(false);
        that._error.raiseEvent(that, error);
        return Cesium.when.reject(error);
    });
};


/**
 * Loads the provided data, replacing any existing data.
 * @param {Object} data The object to be processed.
 */
ApiDataSource.prototype.load = function(data) {
    //>>includeStart('debug', pragmas.debug);
    if (!Cesium.defined(data)) {
        throw new Cesium.DeveloperError('data is required.');
    }
    //>>includeEnd('debug');

    //Clear out any data that might already exist.
    this._setLoading(true);
    this._seriesNames.length = 0;
    this._seriesToDisplay = undefined;

    var heightScale = this.heightScale;
    var entities = this._entityCollection;

    //It's a good idea to suspend events when making changes to a 
    //large amount of entities.  This will cause events to be batched up
    //into the minimal amount of function calls and all take place at the
    //end of processing (when resumeEvents is called).
    entities.suspendEvents();
    entities.removeAll();

    //WebGL Globe JSON is an array of series, where each series itself is an
    //array of two items, the first containing the series name and the second
    //being an array of repeating latitude, longitude, height values.
    //
    //Here's a more visual example.
    //[["series1",[latitude, longitude, height, ... ]
    // ["series2",[latitude, longitude, height, ... ]]

    // Loop over each series
    var entityArr = [];
    for (var x = 0; x < data.length; x++) {
        var series = data[x];
        var seriesName = series[0];
        var coordinates = series[1];

        //Add the name of the series to our list of possible values.
        this._seriesNames.push(seriesName);
        //Make the first series the visible one by default
        var show = x === 0;
        if (show) {
            this._seriesToDisplay = seriesName;
        }

        //Now loop over each coordinate in the series and create

        // our entities from the data.
        entityArr = this.graphVisualisation(coordinates);
    }
    entityArr.map((entity) => {
      entities.add(entity);
    })

    //Once all data is processed, call resumeEvents and raise the changed event.

    entities.resumeEvents();
    this._changed.raiseEvent(this);
    this._setLoading(false);
};

ApiDataSource.prototype._setLoading = function(isLoading) {
    if (this._isLoading !== isLoading) {
        this._isLoading = isLoading;
        this._loading.raiseEvent(this, isLoading);
    }
};

//Now that we've defined our own DataSource, we can use it to load
//any JSON data formatted for WebGL Globe.
function loadData(timecodes) {
    var dataSource = new ApiDataSource();
    for (var i = 0; i < timecodes.length; i++) {
        dataSource.loadUrl(`http://localhost:3000/api/globe/${timecodes[i].date}/${timecodes[i].time}`).then(function() {

            //After the initial load, create buttons to let the user switch among series. 
            function createSeriesSetter(seriesName) {
                return function() {
                    dataSource.seriesToDisplay = seriesName;
                };
            }

            for (var i = 0; i < dataSource.seriesNames.length; i++) {
                var seriesName = dataSource.seriesNames[i];
                Sandcastle.addToolbarButton(seriesName, createSeriesSetter(seriesName));
            }
        });
    }
    return dataSource;
}

module.exports.loadData = loadData;
module.exports.ApiDataSource = ApiDataSource;
module.exports.getGraphEntities = getGraphEntities;
module.exports.getHeatEntities = getHeatEntities;
