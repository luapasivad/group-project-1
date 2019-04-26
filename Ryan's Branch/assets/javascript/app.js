// yelp business search api key: 'nQG0wR9yVtF-Ew4_uQLAJHsU_-lSl3JTqs3ZaZpPOI6lQHnP5nmiNzX5Jh0dBmlYwfaCs_-eM2rzFgAUt445sXF0XP-k8pHFsC6OMTewb2zU8ITA0yU8Pa07G_E7XHYx'
// google maps api key: 'AIzaSyCFTkf1V2_w0As5gnBNmLnMEBWDNwVnulg'

/* ================ Yelp ================ */


function callYelpAPI() {
  let key = 'nQG0wR9yVtF-Ew4_uQLAJHsU_-lSl3JTqs3ZaZpPOI6lQHnP5nmiNzX5Jh0dBmlYwfaCs_-eM2rzFgAUt445sXF0XP-k8pHFsC6OMTewb2zU8ITA0yU8Pa07G_E7XHYx'
  let term = 'breakfast'
  let city = 'orlando'
  let queryURL = `https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?term=${term}&location=${city}`

  $.ajax({
    url: queryURL,
    method: "GET",
    headers: {
      'Authorization': 'Bearer ' + key
    }
  }).then(function(response) {
    console.log(response)
  })
}

callYelpAPI()





/* ================ Google ================ */


// display map and pin locations
function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 8,
    center: {lat: -34.397, lng: 150.644}
  });
  var geocoder = new google.maps.Geocoder();

  document.getElementById('submit').addEventListener('click', function() {
    geocodeAddress(geocoder, map);
  });

}

function geocodeAddress(geocoder, resultsMap) {
  var address = document.getElementById('address').value;
  geocoder.geocode({'address': address}, function(results, status) {
    if (status === 'OK') {
      resultsMap.setCenter(results[0].geometry.location);
      var marker = new google.maps.Marker({
        map: resultsMap,
        position: results[0].geometry.location
      });
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}



// find directions
function initMap2() {
  var directionsService = new google.maps.DirectionsService;
  var directionsDisplay = new google.maps.DirectionsRenderer;
  var map = new google.maps.Map(document.getElementById('map2'), {
    zoom: 7,
    center: {lat: 41.85, lng: -87.65}
  });
  directionsDisplay.setMap(map);

  var onChangeHandler = function() {
    calculateAndDisplayRoute(directionsService, directionsDisplay);
  };
  document.getElementById('start').addEventListener('change', onChangeHandler);
  document.getElementById('end').addEventListener('change', onChangeHandler);
}

function calculateAndDisplayRoute(directionsService, directionsDisplay) {
  directionsService.route({
    origin: document.getElementById('start').value,
    destination: document.getElementById('end').value,
    travelMode: 'DRIVING'
  }, function(response, status) {
    if (status === 'OK') {
      directionsDisplay.setDirections(response);
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });
}
