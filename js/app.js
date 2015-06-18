$(function(){

  var map;
  var geocoder;
  var infowindow;

////////////////////////////////////////////////////////////

  var searchButton = $('#searchbutton').on('click', function(e){
    e.preventDefault;
    var address = $('#address').val();
    showAddressOnMap(address);
    getPlacesOnMap(address,"");
    loadWikiData(address);
    loadFlickrData(address)
  });

  $('input:radio[name="filter"]').change(function() {
      var address = $('#address').val();
      var filter = $(this).val();
      getPlacesOnMap(address,filter.split());
  });

////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////

  // geocoding address and place marker on map
  function showAddressOnMap(address) {
    geocoder = new google.maps.Geocoder();
    geocoder.geocode( {'address': address}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        map.setCenter(results[0].geometry.location);
        var marker = new google.maps.Marker({
          map: map,
          position: results[0].geometry.location
      });
      } else {
        alert("Geocode was not successful for the following reason: " + status);
      }
    });
  };

////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////

  // shows places around address with markers and infowindow
  function getPlacesOnMap(address, filter) {
    geocoder = new google.maps.Geocoder();
    geocoder.geocode( {'address': address}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {

        var startLocation = results[0].geometry.location;
        map = new google.maps.Map(document.getElementById('map-canvas'), {
          center: startLocation,
          zoom: 15 // higher number zooms in
        });
        // map.setCenter(startLocation);

        var request = {
          location: startLocation,
          radius: 500,
          types: filter // ['lodging','restaurant','stores']
        };

        infowindow = new google.maps.InfoWindow();
        var service = new google.maps.places.PlacesService(map);
        service.nearbySearch(request, callback);

      } else {
        alert("Geocode was not successful for the following reason: " + status);
      }
    })
  }

////////////////////////////////////////////////////////////

  function callback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      for (var i = 0; i < results.length; i++) {
        createMarker(results[i]);
      }
    }
  }

////////////////////////////////////////////////////////////

  function createMarker(place) {
    var placeLoc = place.geometry.location;
    var marker = new google.maps.Marker({
      map: map,
      position: place.geometry.location
    });

    google.maps.event.addListener(marker, 'click', function() {
      infowindow.setContent(place.name);
      infowindow.open(map, this);
    });
  }

////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////

  // Get the current position
  // Note: This requires that you consent to location sharing when
  // prompted by your browser. If you see a blank space instead of the map, this
  // is probably because you have denied permission for location sharing.
  function initialize() {

    var mapOptions = {
      zoom: 12
    };
    map = new google.maps.Map(document.getElementById('map-canvas'),
        mapOptions);

    // Try HTML5 geolocation
    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var pos = new google.maps.LatLng(position.coords.latitude,
                                         position.coords.longitude);

        var infowindow = new google.maps.InfoWindow({
          map: map,
          position: pos,
          content: 'Here u are :)'
        });

        map.setCenter(pos);

      }, function() {
        handleNoGeolocation(true);
      });
    } else {
      // Browser doesn't support Geolocation
      handleNoGeolocation(false);
    }
  }

  ////////////////////////////////////////////////////////////

  function handleNoGeolocation(errorFlag) {
    if (errorFlag) {
      var content = 'Error: The Geolocation service failed.';
    } else {
      var content = 'Error: Your browser doesn\'t support geolocation.';
    }

    var options = {
      map: map,
      position: new google.maps.LatLng(60, 105),
      content: content
    };

    var infowindow = new google.maps.InfoWindow(options);
    map.setCenter(options.position);
  }

  ////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////





  google.maps.event.addDomListener(window, 'load', initialize);

  ////////////////////////////////////////////////////////////

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



function loadFlickrData(address) {
    var $flickrElem = $('#flickr-images');
    $flickrElem.text("");
    var $imgLoader = '<img id="loader" src="img/floating-rays-128.gif" alt="Image Loader" >';
    $flickrElem.append($imgLoader);
    var apiKey = '840f99c1773c97cda82934bbd585ba9a';

    // var flickrUrl = "https://api.flickr.com/services/rest/?&amp;method=flickr.photos.search&amp;api_key=840f99c1773c97cda82934bbd585ba9a&amp;woe_id=656958&amp;format=json";
    // var flickrUrl = "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=fe55c54bf73041bb22103a594eefe684&woe_id=656958&format=json&nojsoncallback=1&auth_token=72157654727704541-14efea98aadccf80&api_sig=1a5d8ed46e73a054fde0855813c637b4";
    // var flickrUrl = "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=fe55c54bf73041bb22103a594eefe684&text="+address+"&format=json&nojsoncallback=1&auth_token=72157654727704541-14efea98aadccf80&api_sig=f2183ba703ef3f7821be76964995a3bf";
    var flickrUrl = "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=fe55c54bf73041bb22103a594eefe684&text="+address+"&sort=relevance&format=json&nojsoncallback=1";
    var flickrRequestTimeout = setTimeout(function(){
        $flickrElem.text("failed to get Flickr images");
    }, 8000);

    $.ajax({
      url: flickrUrl,
      dataType: "json",
      success: function(data) {
        console.log(data);
          var photo = data.photos.photo; // photo array of 100 photos
          for (var i=0; i<photo.length; i++) {
            // var owner = photo[i].owner;
            var photo_id = photo[i].id;
            var farm_id = photo[i].farm;
            var server_id = photo[i].server;
            var secret = photo[i].secret;

            // var url = 'http://farm' + item.farm + '.static.flickr.com/' + item.server + '/' + item.id + '_' + item.secret + '_m.jpg'
            var url = 'http://farm' + farm_id + '.static.flickr.com/' + server_id + '/' + photo_id + '_' + secret + '_m.jpg'

            var flickrImageItem = '<div class="pull-left" style="max-width:100px;"><a href="'+url+'" target="_blank"><img src="'+url+'"></a></div>';
            $flickrElem.append(flickrImageItem);
          };
          clearTimeout(flickrRequestTimeout);
          $('#loader').remove();
      }
    })

  };


  //  Wikipedia
  // -------------------------------------------------------------
  // load Wikipedia article
  // Here is the jsonfm URL as an easier-to-read clickable link.
  // api.php?action=query&titles=Main%20Page&prop=revisions&rvprop=content&format=jsonfm

  // var wikiUrl = "http://en.wikipedia.org/w/api.php?action=opensearch&format=json&callback=?&search="+city;
  // var wikiUrl = "http://en.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content&format=jsonfm&titles="+city;

  // jsonp => "JSON with padding", needed to use Wikipedia API because it does not allow pure json requests from different domains
  // jsonp is a simple way to overcome cross domain browser restrictions
  // when using dataType 'jsonp' then we must add the parameter 'callback=?' in our URL
  // the json will get send back wrapped in a function (a function does not fall under the cross domain browser
  // restrictions), but the client treats the response as RAW json, so just like a normal json response

  // Tutorial: http://json-jsonp-tutorial.craic.com/index.html

  // JSONP wraps up a JSON response into a JavaScript function and sends that back as a Script to the
  // browser. A script is not subject to the Same Origin Policy and when loaded into the client, the
  // function acts just like the JSON object that it contains.

  // unfortunately JSONP does not support error handling, therefore we need a workaround using a Timeout
  // function, which we clear in case we got a successful jsonp response

  function loadWikiData(address) {
    var $wikiElem = $('#wikipedia-links');
    $wikiElem.text("");
    // $wikiElem = "";
    // var address = $('#address').val();
    var wikiUrl = "http://en.wikipedia.org/w/api.php?action=opensearch&format=json&callback=?&search="+address;

    var wikiRequestTimeout = setTimeout(function(){
        $wikiElem.text("failed to get Wikipedia articles");
    }, 8000);

    $.ajax({
        url: wikiUrl,
        dataType: "jsonp",
        success: function(response) {
            var articles = response[1];
            for (var i=0; i<articles.length; i++) {
                var url = "http://en.wikipedia.org/wiki/"+articles[i];
                var wikiListItem = "<li><a href=\""+url+"\" target=\"_blank\">"+articles[i]+"</a></li>"
                $wikiElem.append(wikiListItem);
            };
            clearTimeout(wikiRequestTimeout);
        }
    })
  };


})

