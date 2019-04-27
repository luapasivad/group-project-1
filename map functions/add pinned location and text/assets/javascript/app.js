// myAddress will be dynamic
let myAddress = 'Wrigley Field'

function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 8,
    center: {lat: -34.397, lng: 150.644}
  });
  var geocoder = new google.maps.Geocoder();

  geocodeAddress(geocoder, map);
}

function geocodeAddress(geocoder, resultsMap) {
  geocoder.geocode({'address': myAddress}, function(results, status) {
    if (status === 'OK') {
      resultsMap.setCenter(results[0].geometry.location);
      
      // add marker to the map
      var marker = new google.maps.Marker({
        map: resultsMap,
        position: results[0].geometry.location,
        title: myAddress
      });

      // create info window
      var infowindow = new google.maps.InfoWindow({
          content: myAddress,
          maxWidth: 200
        });

        // open window on click
        marker.addListener('click', function() {
          infowindow.open(map, marker);
        });

    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}
