// Adapted from https://developers.google.com/maps/documentation/javascript/examples/maptype-image?hl=nl

// Required by Google Maps API, gets necessary tiles in current view.
var testTypeOptions = {
  getTileUrl: function(coord, zoom) {
      var normalizedCoord = getNormalizedCoord(coord, zoom);
      if (!normalizedCoord) {
        return null;
      }
      var bound = Math.pow(2, zoom);
      return zoom + '/' + normalizedCoord.x + '/' +
          (bound - normalizedCoord.y - 1) + '.png';
  },
  tileSize: new google.maps.Size(256, 256),
  maxZoom: 5,
  minZoom: 3,
  name: 'i-band'
};

var testMapType = new google.maps.ImageMapType(testTypeOptions);

var fileList = [];

var markers = [];

function initialize() {
  var myLatlng = new google.maps.LatLng(-30, 0);

  var mapOptions = {
    center: myLatlng,
    zoomControl: true,
    zoom: 2,
    zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_BOTTOM
    },
    panControl: true,
    panControlOptions: {
        position: google.maps.ControlPosition.RIGHT_BOTTOM
    },
    streetViewControl: false,
    mapTypeControlOptions: {
      mapTypeIds: ['test']
    }
  };

  var map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);
  map.mapTypes.set('test', testMapType);
  map.setMapTypeId('test');

  // Reference at https://developers.google.com/maps/documentation/javascript/datalayer
  // Display data from .json file and hide markers.
  map.data.loadGeoJson('data.json');
  map.data.setStyle(hideMarkers);

  var selectBox = document.getElementById('tile-variable');

  // When zoom > 8, show markers as styled by function showMarkers.
  google.maps.event.addListener(map, 'zoom_changed', function() {
    if (map.getZoom() >= 8 && selectBox.options[selectBox.selectedIndex].value == 'clear') {
      map.data.setStyle(showMarkers);
    } //else {
      //map.data.setStyle(hideMarkers);
    //}
  });
  
  // wire up the drop-down menu
  var dataMin = Number.MAX_VALUE;
  var dataMax = -Number.MAX_VALUE;
  google.maps.event.addDomListener(selectBox, 'change', function() {
    clearMapData();
    var variable = selectBox.options[selectBox.selectedIndex].value;
    if (variable == 'clear' && map.getZoom() >= 8) {
      map.data.setStyle(showMarkers);
      document.getElementById('data-caret').style.display = 'none';
      document.getElementById('data-min').textContent = 'min';
      document.getElementById('data-max').textContent = 'max';
    } else if (variable == 'clear') {
      map.data.setStyle(hideMarkers);
      document.getElementById('data-caret').style.display = 'none';
      document.getElementById('data-min').textContent = 'min';
      document.getElementById('data-max').textContent = 'max';
    } else {
      map.data.setStyle(function(feature) {
        var low = [5, 69, 54];  // color of smallest datum
        var high = [151, 83, 34];   // color of largest datum

        var value = feature.getProperty(variable);
        var delta = (value - dataMin) / (dataMax - dataMin);
        
        var color = [];
        for (var i = 0; i < 3; i++) {
          // calculate an integer color based on the delta
          color[i] = (high[i] - low[i]) * delta + low[i];
        }

        // determine whether to show this shape or not
        var showRow = true;
        if (value == null || isNaN(value)) {
          showRow = false;
        }

        return {
          icon: {
            strokeWeight: 0,
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: 'hsl(' + color[0] + ',' + color[1] + '%,' + color[2] + '%)',
            fillOpacity: 0.75,
            scale: 10,
            visible: showRow
          }
        };
      });
      loadMapData(variable);
    }
  });

  map.data.addListener('click', showInfo);

  map.data.addListener('dblclick', addToFile);

  map.data.addListener('rightclick', showFile);

  var dataMin = 0;
  var dataMax = 0;
  function loadMapData(variable) {
    map.data.forEach(function(feature) {
      var value = feature.getProperty(variable);

      // keep track of min and max values
      if (value < dataMin) {
          dataMin = value;
      }
      if (value > dataMax) {
          dataMax = value;
      }
    });

    document.getElementById('data-min').textContent = dataMin.toLocaleString();
    document.getElementById('data-max').textContent = dataMax.toLocaleString();
  }

  function clearMapData() {
    dataMin = Number.MAX_VALUE;
    dataMax = -Number.MAX_VALUE;
    document.getElementById('data-caret').style.display = 'none';
  }

  // Show tile info and comments, which are stored in the json file.
  function showInfo(event) {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
    }

    // Get info from json file corresponding to click event.
    var marker = new google.maps.Marker({
      position: event.latLng,
      map: map,
      title: event.feature.getProperty('obName')
    });
    markers.push(marker);
    
    // if there is something selected on the drop-down box,
    // show the data-caret at the tile's value
    var selectBox = document.getElementById('tile-variable');
    var variable = selectBox.options[selectBox.selectedIndex].value;
    if (variable != 'clear') {
      var value = event.feature.getProperty(variable);
      var delta = (value - dataMin) / (dataMax - dataMin);
      var caretPercent = delta * 100;
      if(caretPercent >= 98) {
        caretPercent = 97;
      }
      document.getElementById('data-caret').style.display = 'block';
      document.getElementById('data-caret').style.marginLeft = caretPercent + '%';
    }
    
    var info = event.feature.getProperty('info').split(",");
    
    obName = event.feature.getProperty('obName');
    
    var infoContent = '<div class="title-style">Tile info</div>';
    for (i = 0; i < info.length; i++) {
      infoContent += '<span style="padding: 10px 10px;">' + info[i] + '</span><br>';
    }

    // Used a couple of times, so store in variable.
    dividerLine = '<br><div class="divider-line"></div>';
    
    document.getElementById('info-box').innerHTML = infoContent;

    // Create boxes that show info from click event.
    if (!document.getElementById('keyInstructions')) {
      var div = document.createElement('div');
      div.id = 'keyInstructions';
      div.innerHTML = 'Click on a tile and<br>choose an action below or<br>DOUBLE MOUSE CLICK: add tile to list<br>RIGHT MOUSE CLICK: show list contents<br>'
      div.style.fontWeight = 'bold';
      div.style.padding = '10px 10px';
      div.style.color = 'green';
      document.getElementById('comments-box').appendChild(div);

      var div = document.createElement('div');
      div.id = 'keyInstLine';
      div.innerHTML = dividerLine;
      document.getElementById('comments-box').appendChild(div);
    }

    if (!document.getElementById('addButton')) {
      var div = document.createElement('div');
      div.id = 'addButton';
      div.innerHTML = '<span style="cursor:pointer"><img src="addButton.png" width="20" height="20" border="0" alt="add" title="Add to list"></span> Add to list'
      div.style.fontWeight = 'bold';
      div.style.padding = '10px 10px';
      document.getElementById('comments-box').appendChild(div);
    
      var div = document.createElement('div');
      div.id = 'resultAdd';
      div.style.padding = '0px 10px 0px 10px';
      document.getElementById('comments-box').appendChild(div);
    
      var div = document.createElement('div');
      div.id = 'addButtonLine';
      div.innerHTML = dividerLine;
      document.getElementById('comments-box').appendChild(div);
    }

    if (!document.getElementById('showButton')) {
      var div = document.createElement('div');
      div.id = 'showButton';
      div.innerHTML = '<span style="cursor:pointer"><img src="expandButton.jpg" width="20" height="20" border="0" alt="show" title="Show list"></span> Show list contents'
      div.style.fontWeight = 'bold';
      div.style.padding = '10px 10px';
      document.getElementById('comments-box').appendChild(div);
    
      var div = document.createElement('div');
      div.id = 'resultShow';
      div.style.padding = '0px 10px 0px 10px';
      document.getElementById('comments-box').appendChild(div);
    
      var div = document.createElement('div');
      div.id = 'showButtonLine';
      div.innerHTML = dividerLine;
      document.getElementById('comments-box').appendChild(div);
    
      resultHeight = document.getElementById('resultShow').clientHeight;
    }

    if (!document.getElementById('saveButton')) {
      var div = document.createElement('div');
      div.id = 'saveButton';
      div.innerHTML = '<span style="cursor:pointer"><img src="saveButton.png" width="20" height="20" border="0" alt="save" title="Save list"></span> Save list'
      div.style.fontWeight = 'bold';
      div.style.padding = '10px 10px';
      document.getElementById('comments-box').appendChild(div);
    
      var div = document.createElement('div');
      div.id = 'resultSave';
      div.style.padding = '0px 10px 0px 10px';
      document.getElementById('comments-box').appendChild(div);
    }

    document.getElementById('addButton').addEventListener('click', addToFile);
    
    document.getElementById('showButton').addEventListener('click', showFile);
    
    document.getElementById('saveButton').addEventListener('click', saveFile);
    
    document.getElementById('comments-box').style.top = '160px';
    
    document.getElementById('resultSave').innerHTML = '';
    document.getElementById('resultAdd').innerHTML = '';

    if (fileList.length == 0) {
      document.getElementById('showButton').innerHTML = '<span style="cursor:pointer"><img src="expandButton.jpg" width="20" height="20" border="0" alt="show" title="Show list"></span> Show list contents'
      document.getElementById('resultShow').innerHTML = '';
      document.getElementById('resultShow').style.height = resultHeight;
    }
  
  }
}

// Taken from the Google example.
// Normalizes the coords that tiles repeat across the x axis (horizontally)
// like the standard Google map tiles.
function getNormalizedCoord(coord, zoom) {
  var y = coord.y;
  var x = coord.x;

  // tile range in one direction range is dependent on zoom level
  // 0 = 1 tile, 1 = 2 tiles, 2 = 4 tiles, 3 = 8 tiles, etc
  // from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_Operators#Left_shift
  // Bitwise shifting any number x to the left by y bits yields x * 2^y.
  var tileRange = 1 << zoom;

  // don't repeat across y-axis (vertically)
  if (y < 0 || y >= tileRange) {
    return null;
  }

  // repeat or not across x-axis
  if (x < 0 || x >= tileRange) {
    //x = (x % tileRange + tileRange) % tileRange;
    return null;
  }

  return {
    x: x,
    y: y
  };
}

google.maps.event.addDomListener(window, 'load', initialize);
