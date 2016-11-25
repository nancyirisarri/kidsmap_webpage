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
      path: 'M -12,0 L 12,0 l 0,-15 l -24,0 z',
      anchor: new google.maps.Point(1, -8),
      fillColor: 'blue',
      fillOpacity: 0.0,
      strokeWeight: 0,
      scale: 10,
      rotation: 90
    }
  };
}
