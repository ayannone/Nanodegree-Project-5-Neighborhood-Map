$(function(){

  var map;
  var geocoder;
  var infowindow;

////////////////////////////////////////////////////////////

  // var searchButton = $('#searchbutton').on('click', function(e){
  $('#searchbutton').on('click', function(e){
    getAddressAllData(e);
  });

  $('#address').keypress(function(e){
    if (e.which == 13) {
      getAddressAllData(e);
    }
  });

  function getAddressAllData(e) {
    e.preventDefault;
    var address = $('#address').val();
    showAddressOnMap(address);
    getPlacesOnMap(address,"");
    getTwitterTweets(address);
    getYelpReviews(address);
    getWikiLinks(address);
    getFlickrImages(address);
  };

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



  //  Twitter
  // -------------------------------------------------------------
  // How to build a query
  // The best way to build a query and test if it’s valid and will return matched Tweets is to first try it at
  // twitter.com/search. As you get a satisfactory result set, the URL loaded in the browser will contain the
  // proper query syntax that can be reused in the API endpoint.


  // Here’s an example:

  // but before we can actually connect to the API endpoint (btw: always! via https), we need to create an application
  // to get a consumer key and secret for authentication, here https://apps.twitter.com/app/new

  // 'oauth_access_token' => Access token
  // 'oauth_access_token_secret' => Access token secret
  // 'consumer_key' => API key
  // 'consumer_secret' => API secret

  // and do this 'Issuing application-only requests' => https://dev.twitter.com/oauth/application-only

  // 1. We want to search for tweets referencing @twitterapi account. First, we run the search on twitter.com/search
  // 2. Check and copy the URL loaded. In this case, we got: https://twitter.com/search?q=%40twitterapi
  // 3. Replace “https://twitter.com/search” with “https://api.twitter.com/1.1/search/tweets.json” and you will get:
  //    https://api.twitter.com/1.1/search/tweets.json?q=%40twitterapi
  // 4. Execute this URL to do the search in the API

  // https://twitter.com/search?q=%40twitterapi  ==>
  // https://api.twitter.com/1.1/search/tweets.json?q=%40twitterapi

  // https://twitter.com/search?q=hamburg&src=typd&vertical=default&f=tweets  ==>
  // https://api.twitter.com/1.1/search/tweets.json?q=hamburg&src=typd&vertical=default&f=tweets


  // Please note that now API v1.1 requires that the request must be authenticated, check Authentication & Authorization
  // documentation for more details on how to do it. Also note that the search results at twitter.com may return historical
  // results while the Search API usually only serves tweets from the past week.

  // https://api.twitter.com/1.1/search/tweets.json?q=%23freebandnames&since_id=24012619984051000&max_id=250126199840518145&result_type=mixed&count=4
  // https://api.twitter.com/1.1/search/tweets.json?q=%23freebandnames&since_id=24012619984051000&max_id=250126199840518145&result_type=mixed&count=4

          function getTwitterTweets(address) {
          //   var $twitterElem = $('#twitter-tweets');

          //   // initialize
          //   var oauth = OAuth({
          //     consumer: {
          //       public: 'pCeLmJ5VXhXoN3tAu6GWEahu8',
          //       secret: 'xxxxxxxxxxxxxxxxxxxxxxxxx'
          //     },
          //     signature_method: 'HMAC-SHA1'
          //   });

          //   // Your request data

          //   var request_data = {
          //     url: 'https://api.twitter.com/1.1/search/tweets.json?q=hamburg&src=typd&vertical=default&f=tweets',
          //     method: 'GET'
          //     // method: 'POST',
          //     // data: {
          //     //     status: 'Hello Ladies + Gentlemen, a signed OAuth request!'
          //     // }
          //   };

          //   // Your token (optional for some requests)

          //   var token = {
          //     public: '382563042-8z3jheUgy1JjMlikoMn9kbhe1zBooITBw9vSkHQt',
          //     secret: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
          //   };

          //   // Call a request

          //   var twitterRequestTimeout = setTimeout(function(){
          //     $twitterElem.text("failed to get Twitter Tweets");
          //   }, 8000);


          //   $.ajax({
          //       url: request_data.url,
          //       type: request_data.method,
          //       dataType: "jsonp",
          //       data: oauth.authorize(request_data, token)
          //   }).done(function(data) {
          //     console.log(data);
          //     clearTimeout(twitterRequestTimeout);
          //       //process your data here
          //   });
          };


  //  Yelp
  // -------------------------------------------------------------

  function getYelpReviews(address) {

    var $yelpElem = $('#yelp-reviews');
    $yelpElem.text("");

    var yelpRequestTimeout = setTimeout(function(){
        $yelpElem.text("failed to get Yelp Reviews");
    }, 8000);


    var auth = {
      //
      // Update with your auth tokens.
      //
      consumerKey: "6elNSWaVZM9nC76VherCWA",
      consumerSecret: "xxxxxxxxxxxxxxxxxxxxxxxxx",
      accessToken: "sYRyIBg8DOU7iID93eLUhLtEjS8J1WpJ",
      // This example is a proof of concept, for how to use the Yelp v2 API with javascript.
      // You wouldn't actually want to expose your access token secret like this in a real application.
      accessTokenSecret: "xxxxxxxxxxxxxxxxxxxxxxxxxxx",
      serviceProvider: {
        signatureMethod: "HMAC-SHA1"
      }
    };
    var terms = 'food';
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
    console.log(parameterMap);

    $.ajax({
      url: message.action,
      data: parameterMap,
      cache: true,
      dataType: 'jsonp',
      jsonpCallback: 'cb',
      success: function(data) {
        console.log(data);
        $.each(data.businesses,function(i,business){
          var yelp_info = "";
          yelp_info += "<li>";
          yelp_info += "<img src=\""+ business.image_url + "\"><br>";
          yelp_info += business.name + "<br>";
          yelp_info += "Rating: " + business.rating + "<br>";
          yelp_info += "<img src=\""+ business.rating_img_url + "\"><br>";
          yelp_info += "Reviews: " + business.review_count + "<br>";
          // yelp_info += "Address: " + business.location.city + "<br>";
          // yelp_info += "Address: " + business.location.display_address + "<br>";
          yelp_info += "<a href=\"" + business.url + "\">read more</a><br>";
          yelp_info += "</li>";
          $yelpElem.append(yelp_info);
        });
        clearTimeout(yelpRequestTimeout);
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

  function getWikiLinks(address) {
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
    $flickrElem.text("");
    var $imgLoader = '<img id="loader" src="img/floating-rays-128.gif" alt="Image Loader" >';
    $flickrElem.append($imgLoader);
    var apiKey = '840f99c1773c97cda82934bbd585ba9a';

    // var flickrUrl = "https://api.flickr.com/services/rest/?&amp;method=flickr.photos.search&amp;api_key=840f99c1773c97cda82934bbd585ba9a&amp;woe_id=656958&amp;format=json";
    // var flickrUrl = "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=fe55c54bf73041bb22103a594eefe684&woe_id=656958&format=json&nojsoncallback=1&auth_token=72157654727704541-14efea98aadccf80&api_sig=1a5d8ed46e73a054fde0855813c637b4";
    // var flickrUrl = "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=fe55c54bf73041bb22103a594eefe684&text="+address+"&format=json&nojsoncallback=1&auth_token=72157654727704541-14efea98aadccf80&api_sig=f2183ba703ef3f7821be76964995a3bf";
    var flickrUrl = "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key="+apiKey+"&text="+address+"&sort=relevance&per_page=20&format=json&nojsoncallback=1";
    var flickrRequestTimeout = setTimeout(function(){
        $flickrElem.text("failed to get Flickr images");
    }, 8000);

    // $.ajax({
    //   url: flickrUrl,
    //   dataType: "json",
    //   success: function(data) {
    //       var photo = data.photos.photo; // photo array of 100 photos
    //       for (var i=0; i<photo.length; i++) {
    //         // var owner = photo[i].owner;
    //         var photo_id = photo[i].id;
    //         var farm_id = photo[i].farm;
    //         var server_id = photo[i].server;
    //         var secret = photo[i].secret;
    //         var photo_title = photo[i].title;

    //         // var url = 'http://farm' + item.farm + '.static.flickr.com/' + item.server + '/' + item.id + '_' + item.secret + '_m.jpg'
    //         var url = 'https://farm' + farm_id + '.static.flickr.com/' + server_id + '/' + photo_id + '_' + secret + '.jpg'
    //         var url_m = 'https://farm' + farm_id + '.static.flickr.com/' + server_id + '/' + photo_id + '_' + secret + '_m.jpg'
    //         var flickrImageItem = '<div class="pull-left img-container"><a href="'+url+'" target="_blank"><img src="'+url_m+'"></a><p style="background-color:black;color:white;">'+photo_title+'</p></div>';
    //         $flickrElem.append(flickrImageItem);
    //       };
    //       clearTimeout(flickrRequestTimeout);
    //       $('#loader').remove();
    //   }
    // })

    $.getJSON(flickrUrl, function(json) {
      $.each(json.photos.photo,function(i,myresult) {
        var url   = 'http://farm' + myresult.farm + '.static.flickr.com/' + myresult.server + '/' + myresult.id + '_' + myresult.secret + '.jpg';
        var url_m = 'http://farm' + myresult.farm + '.static.flickr.com/' + myresult.server + '/' + myresult.id + '_' + myresult.secret + '_m.jpg';

        var flickrImageItem = '<div class="pull-left img-container"><a href="'+url_m+'" target="_blank"><img src="'+url+'"></a><p style="background-color:black;color:white;">'+myresult.title+'</p></div>';
        $flickrElem.append(flickrImageItem);

        clearTimeout(flickrRequestTimeout);
        $('#loader').remove();
      })
    });

  };


}) // This is the end...

