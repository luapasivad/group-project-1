  // Initialize Firebase
  var config = {
      apiKey: "AIzaSyBHLLHSID8XnKBEARSlZ2xsp9kHrNXjRgo",
      authDomain: "onedayoff-2291e.firebaseapp.com",
      databaseURL: "https://onedayoff-2291e.firebaseio.com",
      projectId: "onedayoff-2291e",
      storageBucket: "onedayoff-2291e.appspot.com",
      messagingSenderId: "1096725822270"
  };
  firebase.initializeApp(config);
const db = firebase.firestore()

var locationTxt = $('#locationTxt'),
    searchTxt = $('#searchTxt'),
    searchBtn = $('#searchBtn'), // btns and text
    resultsDiv = $('#results'),
    currentDayDiv = $('#currentDayDiv'),
    dropdownCatagories = $('#dropdown-catagories'),
    dropdownSortBy = $('#dropdown-SortBy'),
    priceBtn = $('#price'),
    resultsArr = [], // stored array for results (not necessary)
    latSearch = 0,
    lngSearch = 0, // starting lal-lng value for map
    cats = [],
    city = "", // global city term
    searchTerm = "", // global search term
    howMuch = 2, // price variable starting at 2
    sorting = "best_match", // sort variable
    myMarkers = [], // marker array for map
    favMarkers = [], // markers that are added to day plan
    trueOffset = 20, // for next page function
    page = 0, // for next page function
    offset = trueOffset * page, // offset
    currentDayArr = [], // temp storage for creating dayPlan
    favObject = {}

searchBtn.on('click', function () {
    page = 0
    searchTerm = searchTxt.val(); // text box
    city = locationTxt.val(); // text box
    search(city, searchTerm, howMuch, sorting) // function    
})

dropdownCatagories.on('click', 'a', function () {
    // console.log($(this).attr('data-search')) // test
    searchTerm = $(this).attr('data-search') // data from clicking dropdown
    search(city, searchTerm, howMuch, sorting) // function
})

priceBtn.on('click', '.btn', function () {
    // console.log($(this).attr('data-howMuch')) // test
    howMuch = parseInt($(this).attr('data-howMuch')) // data from clicking button and change to number
    search(city, searchTerm, howMuch, sorting) // function
})

dropdownSortBy.on('click', 'a', function () {
    // console.log($(this).attr('data-sortBy')) // test
    sorting = $(this).attr('data-sortBy') // data from clicking button
    search(city, searchTerm, howMuch, sorting) // search
})

resultsDiv.on('click', '#reviewBtn', function () {
    // console.log($(this).attr('data-reviewID'))
    var idTemp = $(this).attr('data-reviewID')
    var clickedTemp = $(this).attr('data-clicked')
    // console.log(clickedTemp)
    if (clickedTemp === "false") {
        // console.log('working')
        reviews(idTemp)
        $(this).attr('data-clicked', true)
    }
})

//save button
resultsDiv.on('click', '#save', function () {
    // console.log(resultsArr)
    // console.log(resultsArr[$(this).attr('data-index')].name)
    let selected = resultsArr[$(this).attr('data-index')]
    currentDayArr.push(selected)
    console.log(currentDayArr)
    $('<div>')
        .attr('id', 'selected-' + selected.id)
        .attr('class', 'mt-2')
        .appendTo(currentDayDiv)
    $('<div>')
        .html("&#8226; " + selected.name)
        .appendTo('#selected-' + selected.id)
    $('<div>')
        .html(" " + selected.address)
        .attr('style', 'font-size: 10px;')
        .appendTo('#selected-' + selected.id)
    
    if (currentDayArr.length >= 1) {
        $('#finalizeBtn').remove()
        $('<button>')
            .attr('class', 'btn btn-sm btn-primary mt-1 float-right')
            .attr('id', 'finalizeBtn')
            .text('finalize')
            .appendTo(currentDayDiv)

    }

    // save map marker
    // grab the id of resultsDiv, it has the same id as its marker
    let thisID = $(this).parent().parent().parent().attr('id')
    myMarkers.forEach( elem => {
        // get id of marker
        let markerID = elem.get('id')
        if (thisID === markerID) {
            favMarkers.push(elem)
            elem.setIcon('https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png')
        } 
    })
})

currentDayDiv.on('click', '#finalizeBtn', function() {
    // console.log('working')
    // push to database
    let userOn = firebase.auth().currentUser
    let email = userOn.email
    let key = ""
    function makeid() {
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let charactersLength = characters.length;
        for ( var i = 0; i < 8; i++ ) {
           key += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return key;
    }

    if (userOn) {
        makeid()
        db.collection('plans').doc(key).set({
            plan: currentDayArr
        })

        db.collection('users').doc(email).collection('keys').add({
            key: key
        })   
            
    } else {
        $('#logInModal').modal('show')
    }


    // clear result markers off map and keep favorite markers
    myMarkers.forEach( elem => {
        elem.setMap(null)
    })
    myMarkers = []

    favMarkers.forEach( elem => {
        showFavMarkers(map, elem)
    })

})

function nextPage() {
    page++
    offset = trueOffset * page
    searchTerm = searchTxt.val(); // text box
    city = locationTxt.val(); 
    search(city, searchTerm, howMuch, sorting, offset)
  }
  
  function prevPage() {
    page--
    offset = trueOffset * page
    searchTerm = searchTerm; // text box
    city = locationTxt.val(); 
    search(city, searchTerm, howMuch, sorting, offset)
  }

function search(where, what, price, sort) {
    resultsDiv.empty() // clears results
    cats = [] // clears catagories for search
    resultsArr = []
    myMarkers = []

    var queryurl = `https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?term=${what}&location=${where}&price=${price}&sort_by=${sort}`
    // dynamic URL ^^

    $.ajax({ // call
        url: queryurl,
        headers: {
            'Authorization': 'Bearer ByKJz0Ky8pL1uwXzQSTxvANlim2VHt4zmsFriFSgK-rXw_I6zpeQrS9EbF_2Qh8fRJ5BqUG6fqK5R-GoGF0bGgClK-wSPgJfUeEY8_bIPTXT5EtUpgnZo0Pvp4zDXHYx'
        },
        method: "GET",
    }).then(function (response) {
        console.log(response) // test
        dropdownCatagories.empty() // empty catagories dropdown to repopulate
        let businesses = response.businesses;

        // searchTxt.val("") // delete text in search boxes
        // locationTxt.val("") 

        latSearch = businesses[0].coordinates.latitude
        lngSearch = businesses[0].coordinates.longitude // coordinates for first location listed

        var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 9,
            center: {
                lat: latSearch,
                lng: lngSearch
            },
            mapTypeControl: false,
            streetViewControl: false
        });


        for (let i = 0; i < businesses.length; i++) {
            let name = businesses[i].name
           
            var favObject = { 
                name: name,
                address: businesses[i].location.address1 + ' <br>' + businesses[i].location.city + ', ' + businesses[i].location.state + ' ' + businesses[i].location.zip_code,
                rating: businesses[i].rating,
                price: businesses[i].price,
                phoneNumber: businesses[i].phone,
                img: businesses[i].image_url,
                id: businesses[i].id,
                location: city,
            }

            resultsArr.push(favObject)

            console.log(businesses[i].location.display_address)
            // re-center the map on current business
            latSearch = businesses[i].coordinates.latitude
            lngSearch = businesses[i].coordinates.longitude
            map.setCenter({
                lat: latSearch,
                lng: lngSearch
            });

            // create marker at current address
            let marker = createMarker(map, name, businesses[i].id)
            myMarkers.push(marker)

            // display markers of favorited locations
            favMarkers.forEach( elem => {
                showFavMarkers(map, elem)
            })

            // console.log(cats) //catagories test

            $('<div>') // container for each result
                .attr('class', 'resultsContainer card w-100 p-2')
                .attr('id', businesses[i].id)
                .appendTo(resultsDiv)
            $('<div>')
                .attr('class', 'row')
                .attr('id', 'row-' + businesses[i].id)
                .appendTo('#' + businesses[i].id)
            $('<div>')
                .attr('class', 'col-sm-auto h-100') // img container
                .attr('id', 'img-' + businesses[i].id)
                .appendTo('#row-' + businesses[i].id)
            $('<img>') // image from result
                .attr('style', 'height: 150px; width: 150px;')
                .attr('class', 'img-fluid card-img')
                .attr('src', businesses[i].image_url)
                .appendTo('#img-' + businesses[i].id)
            $('<div>')
                .attr('class', 'col-sm-6') // text container
                .attr('id', 'text-' + businesses[i].id)
                .appendTo('#row-' + businesses[i].id)
            $('<div>') // title
                .attr('class', 'resultsText w-100')
                .attr('id', 'businessName')
                .html(businesses[i].name) // text
                .appendTo('#text-' + businesses[i].id)
            $('<div>')
                .attr('class', 'w-100')
                .attr('id', 'businessAddress')
                .html(businesses[i].location.address1 + ' <br>' + businesses[i].location.city + ', ' + businesses[i].location.state + ' ' + businesses[i].location.zip_code)
                .appendTo('#text-' + businesses[i].id) // text
            $('<div>')
                .attr('class', 'w-100')
                .html(businesses[i].display_phone) // text
                .appendTo('#text-' + businesses[i].id)
            $('<button>reviews</button>')
                .attr('class', 'btn btn-primary btn-sm mt-2 mb-2')
                .attr('id', 'reviewBtn')
                .attr('data-clicked', "false")
                .attr('data-reviewID', businesses[i].id) // button 
                .appendTo('#text-' + businesses[i].id)
            $('<button>&#9733;</button>')
                .attr('class', 'btn btn-primary btn-sm mt-2 mb-2 ml-2')
                .attr('data-clicked', 'false')
                .attr('data-index', i)
                .attr('id', 'save')
                .appendTo('#text-' + businesses[i].id)


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

function reviews(id) {
    var reviewsURL = `https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/${id}/reviews`

    $.ajax({ // call
        url: reviewsURL,
        headers: {
            'Authorization': 'Bearer ByKJz0Ky8pL1uwXzQSTxvANlim2VHt4zmsFriFSgK-rXw_I6zpeQrS9EbF_2Qh8fRJ5BqUG6fqK5R-GoGF0bGgClK-wSPgJfUeEY8_bIPTXT5EtUpgnZo0Pvp4zDXHYx'
        },
        method: "GET",
    }).then(function (response) {
        console.log(response)
        let reviews = response.reviews
        reviews.forEach(function (review) {

            $('<div>') // review text
                .attr('class', 'mt-1')
                .attr('style', 'font-size: 12px;')
                .text(review.text + "- " + review.user.name + " [" + review.rating + " out of 5]")
                .appendTo('#text-' + id)
        })
    })
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
    marker.addListener('mouseover', function () {
        infowindow.open(map, marker);
    });

    marker.addListener('mouseout', function () {
        infowindow.close(map, marker);
    });

    return marker
}

// show favorite markers on current map
function showFavMarkers(map, marker) {
    marker.setMap(map)
    let favMarker = marker
}

// animate markers when you hover over result
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

// stop animation when you hover away from markers
function stopHighlight() {
    let thisID = $(this).attr('id')
    for (let i = 0; i < myMarkers.length; i++) {
        if (thisID === myMarkers[i].get('id')) {
            myMarkers[i].setAnimation(null);
        }
    }
}

function initMap() {}

function stickTop() {
    var $obj = $('#sidebar');
    var top = $obj.offset().top - parseFloat($obj.css('marginTop').replace(/auto/, 0));
  
    $(window).scroll(function (event) {
      // what the y position of the scroll is
      var y = $(this).scrollTop();
  
      // whether that's below the form
      if (y >= top) {
        // if so, ad the fixed class
        $obj.addClass('fixed');
      } else {
        // otherwise remove it
        $obj.removeClass('fixed');
      }
    });
}

stickTop()

$(document).on('mouseover', '.resultsContainer', highlightMarker)
$(document).on('mouseout', '.resultsContainer', stopHighlight)
$(document).on('click', '#next-btn', nextPage)
$(document).on('click', '#prev-btn', prevPage)


  //====== login ========


  //Get elements
  const emailTxt = $('#emailTxt')
  const passTxt = $('#passTxt')
  const btnLogin = $('#btnLogin')
  const btnSignUp = $('#btnSignUp')
  const btnLogOut = $('#btnLogOut')
  const database = firebase.database()

  //add login event
  btnLogin.on('click', e => {
      const user = emailTxt.val()
      const pass = passTxt.val()
      const auth = firebase.auth();
      // sign in
     const promise = auth.signInWithEmailAndPassword(user, pass);
     promise.catch(e => console.log(e.message))
    console.log(cc.email)
  })
  // sign up
  btnSignUp.on('click', e => { 
    const user = emailTxt.val()
    const pass = passTxt.val()
    const auth = firebase.auth();
    // sign in
   const promise = auth.createUserWithEmailAndPassword(user, pass);
   promise.catch(e => console.log(e.message))
  })
//log out
btnLogOut.on('click', e => {
    firebase.auth().signOut();
})

firebase.auth().onAuthStateChanged(firebaseUser => {
    if(firebaseUser) {
        console.log(firebaseUser)
    }else{
        console.log('not logged in')
    }
})
