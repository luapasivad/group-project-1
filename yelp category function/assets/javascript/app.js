

/* ================ Yelp ================ */

let cats = []


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

    let businesses = response.businesses

    for (let i = 0; i < businesses.length; i++) {
      let categories = businesses[i].categories

      for (let j = 0; j < categories.length; j++) {
        let title = categories[j].title
        if (cats.indexOf(title) === -1 && cats.length < 7)
          cats.push(title)
      }
    }

    cats.forEach(function(elem) {
      console.log(elem);
    })
  })


}

callYelpAPI()
