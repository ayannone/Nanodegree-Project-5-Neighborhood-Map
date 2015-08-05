$(function() {

  $('#find-me').on('click', function(e){
    showCurrentPosition();
  });

  $('#searchbutton').on('click', function(e){
    getAddressAllData(e);
  });

  $('#address').keypress(function(e){
    if (e.which == 13) {
      getAddressAllData(e);
    }
  });

  // Bootstrap Thumbnail Slider
  $('#flickrCarousel').carousel({
    interval: 10000
  });

  $('#yelpCarousel').carousel({
    interval: 10000
  });

  ////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////

  // Get the current position
  // Note: This requires that you consent to location sharing when
  // prompted by your browser. If you see a blank space instead of the map, this
  // is probably because you have denied permission for location sharing.
  function initialize() {
    showCurrentPosition();
  };

  function showCurrentPosition() {

    var mapOptions = {
      zoom: 12
    };
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    // Try HTML5 geolocation
    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

        var infowindow = new google.maps.InfoWindow({
          map: map,
          position: pos,
          content: 'Your current position'
        });

        map.setCenter(pos);

      }, function() {
        handleNoGeolocation(true);
      })
    } else {
      // Browser doesn't support Geolocation
      handleNoGeolocation(false);
    }
  };

  function handleNoGeolocation(errorFlag) {
    if (errorFlag) {
      var content = 'Error: The Geolocation service failed.';
    } else {
      var content = 'Error: Your browser doesn\'t support geolocation.';
    };

    var options = {
      map: map,
      position: new google.maps.LatLng(60, 105),
      content: content
    };

    var infowindow = new google.maps.InfoWindow(options);
    map.setCenter(options.position);
  };

  ////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////

  google.maps.event.addDomListener(window, 'load', initialize);

  ////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////

  function getAddressAllData(e) {
    e.preventDefault;
    var address = $('#address').val();
    showAddressOnMap(address);
    getFoursquarePlaces(address);
    // getFlickrImages(address);
    // getYelpReviews(address);
  };

  // geocoding address and place marker on map
  function showAddressOnMap(address) {
    geocoder = new google.maps.Geocoder();
    geocoder.geocode( {'address': address}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        map.setCenter(results[0].geometry.location);
      } else {
        alert("Geocode was not successful for the following reason: " + status);
      }
    })
  };


  ////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////

  var foursquareLocations = [];

  // Display a map on the page
  var map;
    var bounds = new google.maps.LatLngBounds();
    var mapOptions = {
        zoom: 15,
        mapTypeId: 'roadmap'
    };

  map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

  var infowindow = new google.maps.InfoWindow();

  function createMarker(lat, lng, name, url) {
    var latlng = new google.maps.LatLng(lat,lng);

    var marker = new google.maps.Marker({
      name: name,
      url: url,
      position: latlng,
      map: map
    });

    google.maps.event.addListener(marker, 'click', function() {
      var html = name + "<br><a href=\"" + url + "\" target=\"_blank\">Website</a>";
      infowindow.setContent(html);
      infowindow.open(map, marker);
      // infowindow.open(map, marker, html);
    });

    foursquareLocations[name] = marker;
    return marker;
  };

  function showMarker(name) {
    var marker = foursquareLocations[name];
    marker.setVisible(true);
  };

  function hideMarker(name) {
    var marker = foursquareLocations[name];
    marker.setVisible(false);
  };

  // click on place in places-list to show marker with infowindow on map
  $("#places-list").on("click", "li a", function() {
    var index = $(this).text();
    var marker = foursquareLocations[index];
    var position = marker.getPosition();
    map.setCenter(position);
    var html = marker.name + "<br><a href=\"" + marker.url + "\" target=\"_blank\">Website</a>";
    infowindow.setContent(html);
    infowindow.open(map, marker);
  });


  var hideMarkers = [];
  var fsPlaceNames = [];

  $('#place-filter').keyup(function(e) {

    var input = $('#place-filter').val();

    for (var key in foursquareLocations) {
      if (foursquareLocations.hasOwnProperty(key)) {
        var marker = foursquareLocations[key];
        var markerName = marker.name;
        if (markerName.toLowerCase().indexOf(input.toLowerCase()) < 0) { // if marker does not equal
          // if marker isn't already deleted, then hide it
          if (typeof hideMarkers[markerName] === 'undefined') {
            hideMarker(markerName);
            hideMarkers[markerName] = marker;
          }
        } else { // if marker equals input
          // if marker is in hideMarkers then show on map and delete from hideMarkers
          if (typeof hideMarkers[markerName] !== 'undefined') {
            showMarker(markerName);
            delete hideMarkers[markerName];
          }
        }
      }
    }

    fsPlaceNames = foursquareListEntries;
    var resultPlaces = [];

    for (var i = 0; i < fsPlaceNames.length; i++) {
      var fsPlaceName = fsPlaceNames[i];
      if (fsPlaceName.toLowerCase().indexOf(input.toLowerCase()) > -1) {
        resultPlaces.push(fsPlaceName);
      }
    }

    var $foursquareElem = $('#places-list');
    $foursquareElem.text("");

    for (var i = 0; i < resultPlaces.length; i++) {
      var foursquareListItem = "<li><a href=\"#\">" + resultPlaces[i] + "</a></li>";
      $foursquareElem.append(foursquareListItem);
    }

  })

  ////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////



  //  Foursquare
  // -------------------------------------------------------------

  // In the HTTP request, you need to pass in your client ID, client secret,
  // a version parameter, and any other parameters that the endpoint requires
  // (this is not OAuth):
  // https://api.foursquare.com/v2/venues/search
  // ?client_id=CLIENT_ID
  // &client_secret=CLIENT_SECRET
  // &v=20130815
  // &ll=40.7,-74
  // &query=sushi

   // https://api.foursquare.com/v2/venues/explore?near=chicago;
  var foursquareListEntries = [];

  function getFoursquarePlaces(address) {

    var baseUrl = "https://api.foursquare.com/v2/venues/explore";
    var clientId = "5CF54NJC4GAZTBLXTT4RNIFIZ300VASS2UBFEXT5BZ5FE1UN";
    var clientSecret = "RZEDR3PAPT21NWRJK3LOIDL3LRVVMGEOBI0K3JFUNY1PEAK0";
    var version = '20150619';

    var $foursquareElem = $('#places-list');
    $foursquareElem.text("");

    var foursquareUrl = baseUrl + "?client_id=" + clientId + "&client_secret=" + clientSecret + "&v=" + version + "&venuePhotos=1&near=" + address;

    var foursquareRequestTimeout = setTimeout(function(){
        $foursquareElem.text("failed to get Foursquare places");
    }, 16000);

    $.ajax({
      url: foursquareUrl,
      dataType: "json",
      success: function(data) {
        var places = data.response.groups[0].items;
        for (var i=0; i<places.length; i++) {

          // Make another API call to get Venue details
          // https://api.foursquare.com/v2/venues/VENUE_ID
          var baseVenueUrl = "https://api.foursquare.com/v2/venues/";
          var foursquareVenueUrl = baseVenueUrl + places[i].venue.id + "?client_id=" + clientId + "&client_secret=" + clientSecret + "&v=" + version ;

          $.ajax({
            url: foursquareVenueUrl,
            dataType: "json",
            success: function(data) {
              var venue = data.response.venue;
              var name = venue.name;
              var bestPhotoId = venue.bestPhoto.id;
              // var bestPhotoUrl = venue.bestPhoto.prefix + venue.bestPhoto.height + venue.bestPhoto.suffix;
              var bestPhotoUrl = venue.bestPhoto.prefix + "100" + venue.bestPhoto.suffix;
              var catName = venue.categories[0].name;
              var address = venue.location.address;
              var rating = venue.rating;
              var ratingColor = "#"+venue.ratingColor;
              var price = "";
              if (venue.price) {
                tier = venue.price.tier;
                currency = venue.price.currency;
                price = Array(tier+1).join(currency) + " ";
              };

              var url = venue.url;
              var lat = venue.location.lat;
              var lng = venue.location.lng;

              // ------ this is the only information I need from this ajax call ------
              var urlFSQ = venue.canonicalUrl;
              foursquarePlace = createMarker(lat, lng, name, url);

              // var foursquareListItem = "<li><a href=\"#\">" + name + "</a><br>" + catName + "</a><span style=\"background-color:" + ratingColor + ";\">" + rating + "</span><br>" + price + address + "<br><a href=\"" + url + "\" target=\"_blank\">Website</a><br><img src=\""+ bestPhotoUrl +"\" /></li>";
              var foursquareListItem = "<li><a href=\"#\">" + name + "</a><br>" + catName + "</a><span style=\"background-color:" + ratingColor + ";\">" + rating + "</span><br>" + price + address + "<br><img src=\""+ bestPhotoUrl +"\" /></li>";
              $foursquareElem.append(foursquareListItem);
              foursquareListEntries.push(foursquareListItem);
            }
          })
        }
        clearTimeout(foursquareRequestTimeout);
      }
    })
  };



  //  Yelp
  // -------------------------------------------------------------

  function getYelpReviews(address) {

    var $yelpElem = $('#yelp-reviews');
    // $yelpElem.text("");

    var yelpRequestTimeout = setTimeout(function(){
        $yelpElem.text("failed to get Yelp Reviews");
    }, 8000);


    var auth = {
      //
      // Update with your auth tokens.
      //
      consumerKey: "6elNSWaVZM9nC76VherCWA",
      consumerSecret: "HfSD_E8RG-FGJb6Z2zJJdsCnYXo",
      accessToken: "sYRyIBg8DOU7iID93eLUhLtEjS8J1WpJ",
      // This example is a proof of concept, for how to use the Yelp v2 API with javascript.
      // You wouldn't actually want to expose your access token secret like this in a real application.
      accessTokenSecret: "y4h0hIdiBdFZ2RsL4AWKpUFm2ak",
      serviceProvider: {
        signatureMethod: "HMAC-SHA1"
      }
    };
    var terms = ''; //'food'
    var near = address;
    var accessor = {
      consumerSecret: auth.consumerSecret,
      tokenSecret: auth.accessTokenSecret
    };

    parameters = [];
    parameters.push(['term', terms]);
    parameters.push(['location', near]);
    parameters.push(['callback', 'cb']);
    parameters.push(['oauth_consumer_key', auth.consumerKey]);
    parameters.push(['oauth_token', auth.accessToken]);
    parameters.push(['oauth_signature_method', 'HMAC-SHA1']);

    var message = {
      'action': 'https://api.yelp.com/v2/search',
      'method': 'GET',
      'parameters': parameters
    };

    OAuth.setTimestampAndNonce(message);
    OAuth.SignatureMethod.sign(message, accessor);
    var parameterMap = OAuth.getParameterMap(message.parameters);
    parameterMap.oauth_signature = OAuth.percentEncode(parameterMap.oauth_signature)

    $.ajax({
      url: message.action,
      data: parameterMap,
      cache: true,
      dataType: 'jsonp',
      jsonpCallback: 'cb',
      success: function(data) {
        var $carouselInner = $('yelpCarousel .carousel-inner');
        var divider = 4; // 4 images per row
        var counter = 0;
        var $carouselItemRow;

        $.each(data.businesses,function(i,business){

          if (counter % divider == 0) {
            var rowNum = counter / divider;
            $carouselItemRow = $('#yelpCarouselRow'+rowNum);
            $carouselItemRow.text("");
          };

          var yelp_info = "";
          yelp_info += '<div class="yelp-review">';
          yelp_info += "<img src=\""+ business.image_url + "\"><br>";
          yelp_info += "<p style=\"height:20px;overflow:hidden;\">" + business.name + "</p>";
          yelp_info += "Rating: " + business.rating + "<br>";
          yelp_info += "<img src=\""+ business.rating_img_url + "\"><br>";
          yelp_info += "Reviews: " + business.review_count + "<br>";
          // yelp_info += "Address: " + business.location.city + "<br>";
          // yelp_info += "Address: " + business.location.display_address + "<br>";
          yelp_info += "<a href=\"" + business.url + "\" target=\"_blank\">read more on Yelp</a><br>";
          yelp_info += "</div>";

          $carouselItemRow.append(yelp_info);

          counter += 1;

          clearTimeout(yelpRequestTimeout);
        })
      }
    })
  };


  //  Flickr
  // -------------------------------------------------------------
  // REST Request Format
  // REST is the simplest request format to use - it's a simple HTTP GET or POST action.

  // The REST Endpoint URL is https://api.flickr.com/services/rest/

  // To request the flickr.test.echo service, invoke like this:
  // https://api.flickr.com/services/rest/?method=flickr.test.echo&name=value

  // 1. Step: get the woeids for the searched location/address
  // URL: https://api.flickr.com/services/rest/?method=flickr.places.find&api_key=840f99c1773c97cda82934bbd585ba9a&query=hamburg%2C+germany&format=json
  // Result:
  // jsonFlickrApi({ "places": {
  //     "place": [
  //       { "place_id": "cksTdXBXV7yTmdw", "woeid": "656958", "latitude": 53.553, "longitude": 9.992, "place_url": "\/Germany\/Hamburg\/Hamburg", "place_type": "locality", "place_type_id": 7, "timezone": "Europe\/Berlin", "_content": "Hamburg, HH, Germany", "woe_name": "Hamburg" },
  //       { "place_id": ".MMq_ENTUb5YOOrp", "woeid": "2345484", "latitude": 53.567, "longitude": 10.027, "place_url": "\/Germany\/Hamburg", "place_type": "region", "place_type_id": 8, "timezone": "Europe\/Berlin", "_content": "Hamburg, Germany", "woe_name": "Hamburg" },
  //       { "place_id": "zFjtAiFXWrr04Es", "woeid": "680564", "latitude": 49.454, "longitude": 11.073, "place_url": "\/Germany\/Bavaria\/N%C3%BCrnberg\/in-Nuremberg", "place_type": "locality", "place_type_id": 7, "timezone": "Europe\/Berlin", "_content": "Nuremberg, Bavaria, Germany", "woe_name": "Nuremberg" }
  //     ], "query": "hamburg, germany", "total": 3 }, "stat": "ok" })


  // 2. Step: get the photo list for woeid
  // https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=840f99c1773c97cda82934bbd585ba9a&woe_id=656958&format=json
  // Result:
  // jsonFlickrApi({ "photos": { "page": 1, "pages": "4356", "perpage": 100, "total": "435529",
  //     "photo": [
  //       { "id": "18281754384", "owner": "133361073@N02", "secret": "f8a20897d3", "server": "5458", "farm": 6, "title": "Blühende Akelei (Hybrid Aquilegia)", "ispublic": 1, "isfriend": 0, "isfamily": 0 },
  //       { "id": "18716358300", "owner": "81766462@N00", "secret": "041822cab4", "server": "5462", "farm": 6, "title": "Street", "ispublic": 1, "isfriend": 0, "isfamily": 0 },
  //       { "id": "18282296453", "owner": "52839953@N03", "secret": "f64f53899e", "server": "497", "farm": 1, "title": "Bugsier", "ispublic": 1, "isfriend": 0, "isfamily": 0 },
  // ...
  //       { "id": "18249414713", "owner": "127427422@N04", "secret": "788276b30c", "server": "3691", "farm": 4, "title": "www.poopmap.de", "ispublic": 1, "isfriend": 0, "isfamily": 0 },
  //       { "id": "18683876039", "owner": "127427422@N04", "secret": "eebd1a0581", "server": "5347", "farm": 6, "title": "www.poopmap.de", "ispublic": 1, "isfriend": 0, "isfamily": 0 },
  //       { "id": "18249388213", "owner": "127427422@N04", "secret": "c0f379fbd1", "server": "3878", "farm": 4, "title": "www.poopmap.de", "ispublic": 1, "isfriend": 0, "isfamily": 0 }
  //       ] }, "stat": "ok" })
  //
  // Flickr Image Urls: http://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}.jpg

  // 3. Step: get the photos
  // http://www.flickr.com/photos/133361073@N02/18281754384/
  // http://www.flickr.com/photos/81766462@N00/18716358300/
  // http://www.flickr.com/photos/52839953@N03/18282296453/


  function getFlickrImages(address) {
    var $flickrElem = $('#flickr-images');
    var apiKey = '840f99c1773c97cda82934bbd585ba9a';

    var flickrUrl = "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key="+apiKey+"&text="+address+"&sort=relevance&per_page=20&format=json&nojsoncallback=1";
    var flickrRequestTimeout = setTimeout(function(){
        $flickrElem.text("failed to get Flickr images");
    }, 8000);

    $.getJSON(flickrUrl, function(json) {
      var $carouselInner = $('flickrCarousel .carousel-inner');
      var photosNum = json.photos.photo.length; // retrieving 20 images per page, 1 page
      var divider = 4; // 4 images per row
      var counter = 0;
      var $carouselItemRow;

      $.each(json.photos.photo,function(i,myresult) {

        if (counter % divider == 0) {
          var rowNum = counter / divider;
          $carouselItemRow = $('#flickrCarouselRow'+rowNum);
          $carouselItemRow.text("");
        };

        var url_b   = 'http://farm' + myresult.farm + '.static.flickr.com/' + myresult.server + '/' + myresult.id + '_' + myresult.secret + '_b.jpg';
        var url_m = 'http://farm' + myresult.farm + '.static.flickr.com/' + myresult.server + '/' + myresult.id + '_' + myresult.secret + '_m.jpg';

        var $carouselItemRowImage = '<div class="col-sm-3"><a href="'+url_b+'" target="_blank" class="thumbnail"><img src="'+url_m+'" alt="' + myresult.title + '" style="max-width:100%;"></a></div>';
        $carouselItemRow.append($carouselItemRowImage);

        counter += 1;

        clearTimeout(flickrRequestTimeout);
      })
    })
  };

})
