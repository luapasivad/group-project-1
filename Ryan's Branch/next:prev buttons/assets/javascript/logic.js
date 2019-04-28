var locationTxt = $('#locationTxt'),
    searchTxt = $('#searchTxt'),
    searchBtn = $('#searchBtn'), // btns and text
    resultsDiv = $('#results'),
    dropdownCatagories = $('#dropdown-catagories'),
    dropdownSortBy = $('#dropdown-SortBy'),
    priceBtn = $('#price')
    results_array = [], // stored array for results (not necessary)
    latSearch = 0,
    lngSearch = 0, // starting lal-lng value for map
    cats = [],
    city = "", // global city term
    searchTerm = "", // global search term
    howMuch = 2, // price variable starting at 2
    sorting = "best_match";

var myMarkers = []
var trueOffset = 20
var page = 0
var offset = trueOffset * page


searchBtn.on('click', function() {
    searchTerm = searchTxt.val(); // text box
    city = locationTxt.val(); // text box
    search(city, searchTerm, howMuch, sorting, offset) // function    
})

dropdownCatagories.on('click', 'a', function(){
    // console.log($(this).attr('data-search')) // test
    searchTerm = $(this).attr('data-search') // data from clicking dropdown
    search(city, searchTerm, howMuch, sorting, offset) // function

})

priceBtn.on('click', '.btn', function(){
    // console.log($(this).attr('data-howMuch')) // test
    howMuch = parseInt($(this).attr('data-howMuch')) // data from clicking button and change to number
    search(city, searchTerm, howMuch, sorting, offset) // function
})

dropdownSortBy.on('click', 'a', function() {
    // console.log($(this).attr('data-sortBy')) // test
    sorting = $(this).attr('data-sortBy') // data from clicking button
    search(city, searchTerm, howMuch, sorting, offset) // search
})

function nextPage() {
  event.preventDefault()
  page++
  offset = trueOffset * page
  searchTerm = searchTxt.val(); // text box
  city = locationTxt.val(); 
  search(city, searchTerm, howMuch, sorting, offset)
}

function prevPage() {
  event.preventDefault()
  page--
  offset = trueOffset * page
  searchTerm = searchTxt.val(); // text box
  city = locationTxt.val(); 
  search(city, searchTerm, howMuch, sorting, offset)
}



function search(where, what, price, sort, offset) {
    resultsDiv.empty() // clears results
    cats = [] // clears catagories for search

    var queryurl = `https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?term=${what}&location=${where}&price=${price}&sort_by=${sort}&offset=${offset}`
    // dynamic URL ^^

    $.ajax({ // call
        url: queryurl,
        headers: {
            'Authorization':'Bearer ByKJz0Ky8pL1uwXzQSTxvANlim2VHt4zmsFriFSgK-rXw_I6zpeQrS9EbF_2Qh8fRJ5BqUG6fqK5R-GoGF0bGgClK-wSPgJfUeEY8_bIPTXT5EtUpgnZo0Pvp4zDXHYx'
        },
        method: "GET",
        }).then(function(response) {
            console.log(response) // test
            dropdownCatagories.empty() // empty catagories dropdown to repopulate
            let businesses = response.businesses;

            // searchTxt.val("") // delete text in search boxes
            // locationTxt.val("") 

            latSearch = businesses[0].coordinates.latitude
            lngSearch = businesses[0].coordinates.longitude // coordinates for first location listed

            // create map
            var map = new google.maps.Map(document.getElementById('map'), {
              zoom: 9,
              center: {lat: latSearch, lng: lngSearch}
            });

            for (let i=0; i < businesses.length; i++){

              let name = businesses[i].name

              // re-center the map on current business
              latSearch = businesses[i].coordinates.latitude
              lngSearch = businesses[i].coordinates.longitude
              map.setCenter({lat: latSearch, lng: lngSearch}); 

              // create marker at current address
              let marker = createMarker(map, name, businesses[i].id)
              myMarkers.push(marker)

              results_array.push(businesses[i]) // adds to result array
              // console.log(cats) //catagories test

              $('<div>') // container for each result
                  .attr('class', 'resultsContainer m-2 w-100')      
                  .attr('id', businesses[i].id) 
                  .appendTo(resultsDiv)   
              $('<img>') // image from result
                  .attr('style', 'height: 100px; width: 100px; display: inline-block;')
                  .attr('class', 'img-fluid')
                  .attr('src', businesses[i].image_url)
                  .appendTo('#' + businesses[i].id)
              $('<span>') // title
                  .attr('class', 'resultsText ml-2')
                  .text(businesses[i].name)
                  .appendTo('#' + businesses[i].id)

              let categories = businesses[i].categories
      
              for (let j = 0; j < categories.length; j++) { // pull categories from search
                  let title = categories[j].title;
                  if (cats.indexOf(title) === -1 && cats.length < 7) {
                      $('<a>')
                          .attr('class', 'dropdown-item')
                          .text(title)
                          .attr('data-search', title)
                          .appendTo(dropdownCatagories) // create in dropdown
                  
                      cats.push(title) // array of categories (not sure if needed)
                  }
              }
            }
            // console.log(results_array) // for test
            $('<button>')
                  .html('Prev Page')
                  .attr('class', 'btn btn-primary')
                  .attr('id', 'prev-btn')
                  .wrap('<a href="#"></a>')
                  .appendTo(resultsDiv)  
            $('<button>')
                  .html('Next Page')
                  .attr('class', 'btn btn-primary')
                  .attr('id', 'next-btn')
                  .wrap('<a href="#"></a>')
                  .appendTo(resultsDiv)  

            if (page < 1) $('#prev-btn').hide()
        });
    }

function createMarker(map, name, id) {
  // create a marker
  var marker = new google.maps.Marker({
    map: map,
    position: map.center,
    title: name,
    id: id
  });

  // create info window
  var infowindow = new google.maps.InfoWindow({
    content: name,
    maxWidth: 200
  });

  // open window on hover
  marker.addListener('mouseover', function() {
    infowindow.open(map, marker);
  });

  marker.addListener('mouseout', function() {
    infowindow.close(map, marker);
  });

  return marker
}


// animates map markers when hovering over a result
function highlightMarker() {
  let thisID = $(this).attr('id')
  for (let i = 0; i < myMarkers.length; i++) {
    if (thisID === myMarkers[i].get('id')) {
      myMarkers[i].setAnimation(google.maps.Animation.BOUNCE)
    } else {
      myMarkers[i].setAnimation(null)
    }
  }
}

// stops animation of map markers
function stopHighlight() {
  let thisID = $(this).attr('id')
  for (let i = 0; i < myMarkers.length; i++) {
    if (thisID === myMarkers[i].get('id')) {
      myMarkers[i].setAnimation(null);
    }
  }
}



$(document).on('mouseover', '.resultsContainer', highlightMarker)
$(document).on('mouseout', '.resultsContainer', stopHighlight)
$(document).on('click', '#next-btn', nextPage)
$(document).on('click', '#prev-btn', prevPage)

  