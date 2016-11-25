// Adapted from https://developers.google.com/maps/documentation/javascript/examples/maptype-image?hl=nl

// Required by Google Maps API, gets necessary tiles in current view.
var testTypeOptions = {
  getTileUrl: function(coord, zoom) {
      var normalizedCoord = getNormalizedCoord(coord, zoom);
      if (!normalizedCoord) {
        return null;
      }
      var bound = Math.pow(2, zoom);
      return 'http://www.astro.rug.nl/~irisarri/kidsmap/' +
          '/' + zoom + '/' + normalizedCoord.x + '/' +
          (bound - normalizedCoord.y - 1) + '.png';
  },
  tileSize: new google.maps.Size(256, 256),
  maxZoom: 9,
  minZoom: 2,
  name: 'i-band'
};

var testMapType = new google.maps.ImageMapType(testTypeOptions);

// Create array that will hold clicked-on tiles.
var fileList = [];

// Create array to hold Map Markers.
var markers = [];

function initialize() {

  var myLatlng = new google.maps.LatLng(-10, 0);
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

  // When zoom = 8, show markers as styled by function showMarkers.
  google.maps.event.addListener(map, 'zoom_changed', function() {
    if (map.getZoom() >= 8) {
      map.data.setStyle(showMarkers);
    } else {
      map.data.setStyle(hideMarkers);
    }
  });

  // On click, extract from json file the image url and display on
  // div with id image-box.
  map.data.addListener('click', showInfo);

  // Listen on mouse double click. Handler adds the clicked-on image to a list.
  map.data.addListener('dblclick', addToFile);

  // Listen on mouse right click. Handler shows the list created by the user.
  map.data.addListener('rightclick', showFile);

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

    var info = event.feature.getProperty('info').split(",");

    obName = event.feature.getProperty('obName');

    var infoContent = '<div class="title-style">Tile info</div>';
    for (i = 0; i < info.length; i++) {
      infoContent += '<span style="padding: 10px 10px;">' + info[i] + '</span><br>';
    }

    // Used a couple of times, so store in variable.
    var dividerLine = '<br><div class="divider-line"></div>';

    document.getElementById('info-box').innerHTML = infoContent;

    // Create boxes that show info from click event.
    if (!document.getElementById('keyInstructions')) {
      var div = document.createElement('div');
      div.id = 'keyInstructions';
      div.innerHTML = 'Choose an action below or...<br>DOUBLE MOUSE CLICK: add to file<br>RIGHT MOUSE CLICK: show file contents<br>'
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
      div.innerHTML = '<span style="cursor:pointer"><img src="addButton.png" width="20" height="20" border="0" alt="add"></span> Add to file'
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
      div.innerHTML = '<span style="cursor:pointer"><img src="expandButton.jpg" width="20" height="20" border="0" alt="show" ></span> Show file contents'
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
      div.innerHTML = '<span style="cursor:pointer"><img src="saveButton.png" width="20" height="20" border="0" alt="save"></span> Save file'
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
      document.getElementById('showButton').innerHTML = '<span style="cursor:pointer"><img src="expandButton.jpg" width="20" height="20" border="0" alt="show" ></span> Show file contents'
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

  // repeat across x-axis
  if (x < 0 || x >= tileRange) {
    //x = (x % tileRange + tileRange) % tileRange;
    return null;
  }

  return {
    x: x,
    y: y
  };
}

// Hides markers but keeps their info; called on function initialize.
function hideMarkers() {
  return {
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: 'black',
      fillOpacity: 0.0,
      strokeWeight: 0,
      scale: 20,
    }
  };
}

// Makes markers larger in order to have big clickable area; called when zoom = 8.
function showMarkers() {
  return {
    icon: {
      path: 'M -12,0 L 12,0 l 0,-15 l -24,0 z',//'M -90,0 L 90,0 l 0,360 l -180,0 z',
      anchor: new google.maps.Point(1, -8),
      fillColor: 'blue',
      fillOpacity: 0.0,
      strokeWeight: 0,
      scale: 10,
      rotation: 90
    }
  };
}

google.maps.event.addDomListener(window, 'load', initialize);
