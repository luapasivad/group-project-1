var locationTxt = $('#locationTxt'),
    searchTxt = $('#searchTxt'),
    searchBtn = $('#searchBtn'),
    resultsDiv = $('#results'),
    results_array = [],
    latSearch = 0,
    lngSearch = 0;



searchBtn.on('click', function() {

    let city = locationTxt.val(),
        searchTerm = searchTxt.val();

    resultsDiv.empty()

    $.ajax({
        url: `https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?term=${searchTerm}&location=${city}`,
        headers: {
            'Authorization':'Bearer ByKJz0Ky8pL1uwXzQSTxvANlim2VHt4zmsFriFSgK-rXw_I6zpeQrS9EbF_2Qh8fRJ5BqUG6fqK5R-GoGF0bGgClK-wSPgJfUeEY8_bIPTXT5EtUpgnZo0Pvp4zDXHYx'
        },
        method: "GET",
        }).then(function(response) {
            console.log(response)
            searchTxt.val("")
            locationTxt.val("")

            latSearch = response.businesses[0].coordinates.latitude
            lngSearch = response.businesses[0].coordinates.longitude


            initMap()

            for (let i=0; i < response.businesses.length; i++){
                results_array.push(response.businesses[i])


                $('<div>')   
                    .attr('class', 'resultsContainer m-2 w-100')      
                    .attr('id', response.businesses[i].id) 
                    .appendTo(resultsDiv)      
                $('<img>')
                    .attr('style', 'height: 200px; width: 200px; display: inline-block;')

                    .attr('src', response.businesses[i].image_url)
                    .appendTo('#' + response.businesses[i].id)
                $('<span>')
                    .attr('class', 'resultsText ml-2')
                    .text(response.businesses[i].name)
                    .appendTo('#' + response.businesses[i].id)

                    
                
            }
            console.log(results_array)
        });
        
})



function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
      zoom: 8,
      center: {lat: latSearch, lng: lngSearch}
    });
    var geocoder = new google.maps.Geocoder();
  
    // document.getElementById('submit').addEventListener('click', function() {
    //   geocodeAddress(geocoder, map);
    // });
  
  }
  
//   function geocodeAddress(geocoder, resultsMap) {
//     var address = document.getElementById('address').value;
//     geocoder.geocode({'address': address}, function(results, status) {
//       if (status === 'OK') {
//         resultsMap.setCenter(results[0].geometry.location);
//         var marker = new google.maps.Marker({
//           map: resultsMap,
//           position: results[0].geometry.location
//         });
//       } else {
//         alert('Geocode was not successful for the following reason: ' + status);
//       }
//     });
//   }