$(function() {

  var defaultAddress = "Hamburg";

  function initialize(e) {
    e.preventDefault;
    vm.getAddressAllData(e);

    // Initialize Slick Images Carousel Slider
    $('.slick-images-slider').slick({
      infinite: true,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 1500,
      variableWidth: true
    });
    // Initialize Slick Reviews Carousel Slider
    $('.slick-reviews-slider').slick({
      infinite: true,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 5000,
      variableWidth: true
    })
  };

  google.maps.event.addDomListener(window, 'load', initialize);

  ////////////////////////////////////////////////////////////

  // this function is getting called from within the viewmodel function 'getFoursquarePlaces'
  function showAddressOnMap() {
    geocoder = new google.maps.Geocoder();
    geocoder.geocode( {'address': vm.address()}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        map.setCenter(results[0].geometry.location);
      } else {
        alert("Geocode was not successful for the following reason: " + status);
      }
    })
  };

  ////////////////////////////////////////////////////////////
  //////// Google maps

  var foursquareLocations = [];

  // Display a map on the page
  var map;
    var bounds = new google.maps.LatLngBounds();
    var mapOptions = {
        // zoom: 15,
        zoom: 12,
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
      map: map,
      animation: google.maps.Animation.DROP
    });

    google.maps.event.addListener(marker, 'click', function() {
      vm.places().forEach(function(place) {
        if (place.name.toLowerCase() == marker.name.toLowerCase()) {
          openInfoWindow(place, marker);
        }
      })
    });

    google.maps.event.addListener(marker, 'click', function() {
      marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function(){
         marker.setAnimation(null);
      }, 2150);
    });

    foursquareLocations[name] = marker;
    return marker;
  };

  function openInfoWindow(place, marker) {
    var html = place.buildInfoWindowContent();
    infowindow.setContent(html);
    infowindow.open(map, marker);
  };

  function toggleBounce(marker) {
    if (marker.getAnimation() !== null) {
      marker.setAnimation(null);
    } else {
      marker.setAnimation(google.maps.Animation.BOUNCE);
    }
  };

  function showMarker(name) {
    var marker = foursquareLocations[name];
    marker.setVisible(true);
  };

  function hideMarker(name) {
    var marker = foursquareLocations[name];
    marker.setVisible(false);
  };

  function removeMarker(name) {
    var marker = foursquareLocations[name];
    marker.setMap(null);
  };

  ////////////////////////////////////////////////////////////
  //////// Knockout.js

  // Model - Place construction
  var Place = function() {
    var that = this;

    that.name = "";
    that.bestPhotoId = "";
    that.bestPhotoUrl = "";
    that.bestPhotoUrlLarge = "";
    that.catName = "";
    that.streetAddress = "";
    that.city = "";
    that.state = "";
    that.postalCode = "";
    that.country = "";
    that.rating = "";
    that.ratingColor = "";
    that.price = "";
    that.description = "";
    that.url = "";
    that.lat = "";
    that.lng = "";
    that.urlFSQ = "";

    that.shouldShowPlace = ko.observable(true);
    that.isSelected = ko.observable(false);

    that.buildAddress = function() {
      var address = "";
      if (typeof that.streetAddress !== "undefined") { address += that.streetAddress + ", " };
      if (typeof that.city !== "undefined") { address += that.city + ", " };
      if (typeof that.state !== "undefined" && that.state != that.city) { address += that.state + ", " };
      if (typeof that.postalCode !== "undefined") { address += that.postalCode };
      if (typeof that.country !== "undefined") { address += ", " + that.country };
      return address;
    };

    that.buildInfoWindowContent = function() {
      var infoWindowContent = "";
      infoWindowContent += "<p>" + that.name + "</p><hr>";
      if (typeof that.description !== "undefined") { infoWindowContent += that.description + "<br>"};
      infoWindowContent += "<a href=\"" + that.bestPhotoUrlLarge + "\" target=\"_blank\"><img src=\"" + that.bestPhotoUrl + "\" /></a><br>";
      infoWindowContent += "<a href=\"" + that.url + "\" target=\"_blank\">Website</a>";
      return infoWindowContent;
    }
  };

  // Model - Image construction
  var FlickrImage = function() {
    var that = this;

    that.title = "";
    that.url_b = "";
    that.url_m = "";

    that.buildImage = function() {
      return '<a href="' + that.url_b + '" target="_blank"><img src="' + that.url_m + '" alt="' + that.title + '"></a></div>';
    }
  };

  // Model - Review construction
  var YelpReview = function() {
    var that = this;

    that.imageUrl = "";
    that.name = "";
    that.rating = "";
    that.ratingImgUrl = "";
    that.reviewCount = "";
    that.url = "";

    that.buildReview = function() {
      var yelpReview = "";
      yelpReview += '<div class="yelp-review">';
      yelpReview += "<img src=\""+ that.imageUrl + "\"><br>";
      yelpReview += "<p style=\"height:20px;overflow:hidden;\">" + that.name + "</p>";
      yelpReview += "Rating: " + that.rating + "<br>";
      yelpReview += "<img src=\""+ that.ratingImgUrl + "\"><br>";
      yelpReview += "Reviews: " + that.reviewCount + "<br>";
      yelpReview += "<a href=\"" + that.url + "\" target=\"_blank\">read more on Yelp</a><br>";
      yelpReview += "</div>";
      return yelpReview;
    }
  };

  // ViewModel
  vm = {
    address: ko.observable(defaultAddress),
    placeFilter: ko.observable([]),
    places: ko.observableArray([]),
    flickrImages: ko.observableArray([]),
    yelpReviews: ko.observableArray([]),

    shouldShowList: ko.observable(true),
    shouldShowListError: ko.observable(false),
    shouldShowImagesSlider: ko.observable(true),
    shouldShowReviewSlider: ko.observable(true),

    highlightMarker: function(place) {
      this.isSelected(true);
      var marker = foursquareLocations[this.name];
      var position = marker.getPosition();
      openInfoWindow(place, marker);
      toggleBounce(marker);
    },

    unhighlightMarker: function(place) {
      this.isSelected(false);
      var marker = foursquareLocations[this.name];
      toggleBounce(marker);
    },

    // this function is getting called, when user clicks into the input field to filter the places list
    clickedPlaceFilter: function() {
      infowindow.close();
    },

    filterPlaces: function() {
      var input = vm.placeFilter().toLowerCase();

      vm.places().forEach(function(place) {
        // if search string is not part of the place name
        if (place.name.toLowerCase().indexOf(input) < 0) {
          hideMarker(place.name);
          place.shouldShowPlace(false);
        } else {
          showMarker(place.name);
          place.shouldShowPlace(true);
        }
      })
    },

    searchOnEnter: function(data, event) {
      var keyCode = (event.which ? event.which : event.keyCode);
      if (keyCode === 13) {
        this.getAddressAllData();
        return false;
      }
      return true;
    },

    getAddressAllData: function() {
      vm.getFoursquarePlaces();
      vm.getFlickrImages();
      vm.getYelpReviews();
    },

    getFoursquarePlaces: function() {

      // clear markers from map and places list
      vm.places().forEach(function(place) {
        removeMarker(place.name);
      });
      vm.places.removeAll();

      var baseUrl = "https://api.foursquare.com/v2/venues/explore";
      var clientId = "5CF54NJC4GAZTBLXTT4RNIFIZ300VASS2UBFEXT5BZ5FE1UN";
      var clientSecret = "RZEDR3PAPT21NWRJK3LOIDL3LRVVMGEOBI0K3JFUNY1PEAK0";
      var version = '20150619';

      showAddressOnMap(); // function outside the viewmodel

      var foursquareUrl = baseUrl + "?client_id=" + clientId + "&client_secret=" + clientSecret + "&v=" + version + "&venuePhotos=1&near=" + vm.address();

      $.ajax({
        url: foursquareUrl,
        dataType: "json",
        success: function(data) {
          var fsqPlaces = data.response.groups[0].items;
          for (var i=0; i<fsqPlaces.length; i++) {

            // Make another API call to get Venue details
            // https://api.foursquare.com/v2/venues/VENUE_ID
            var baseVenueUrl = "https://api.foursquare.com/v2/venues/";
            var foursquareVenueUrl = baseVenueUrl + fsqPlaces[i].venue.id + "?client_id=" + clientId + "&client_secret=" + clientSecret + "&v=" + version ;

            $.ajax({
              url: foursquareVenueUrl,
              dataType: "json",
              success: function(data) {
                var venue = data.response.venue;

                var that = this;
                that.Place = new Place();

                that.Place.name = venue.name;
                that.Place.bestPhotoId = venue.bestPhoto.id;
                that.Place.bestPhotoUrl = venue.bestPhoto.prefix + "100" + venue.bestPhoto.suffix;
                that.Place.bestPhotoUrlLarge = venue.bestPhoto.prefix + venue.bestPhoto.height + venue.bestPhoto.suffix;
                that.Place.catName = venue.categories[0].name;
                that.Place.streetAddress = venue.location.address;
                that.Place.city = venue.location.city;
                that.Place.state = venue.location.state;
                that.Place.postalCode = venue.location.postalCode;
                that.Place.country = venue.location.country;
                that.Place.rating = venue.rating ? venue.rating : "-";
                that.Place.ratingColor = "#"+venue.ratingColor;
                that.Place.description = venue.description;
                that.Place.price = "";
                if (venue.price) {
                  tier = venue.price.tier;
                  currency = venue.price.currency;
                  that.Place.price = Array(tier+1).join(currency) + " ";
                };

                that.Place.url = venue.url;
                that.Place.lat = venue.location.lat;
                that.Place.lng = venue.location.lng;

                // ------ this is the only information I need from this ajax call ------
                that.Place.urlFSQ = venue.canonicalUrl ? venue.canonicalUrl : "";

                createMarker(that.Place.lat, that.Place.lng, that.Place.name, that.Place.url);

                vm.places.push(that.Place);
              },
              error: function(response) {
                console.log('error:', response);
              }
            }) // end inner ajax
          } // end for

        }, // end success
        error: function(response) {
          vm.shouldShowList(false);
          vm.shouldShowListError(true);
          $('#place-error').text('Failed to get Foursquare places: ' + response.statusText + ' (Status Code: ' + response.status + ')');
          console.log('error: ', response);
        }
      }) // end outer ajax

    }, // end function getFoursquarePlaces

    getFlickrImages: function() {

      var flickrImagesUnderlyingArray = vm.flickrImages();
      if (flickrImagesUnderlyingArray.length > 0) {
        while (flickrImagesUnderlyingArray.length > 0) {
          $('.slick-images-slider').slick('slickRemove', flickrImagesUnderlyingArray.length - 1);
          flickrImagesUnderlyingArray.shift();
        }
        vm.flickrImages.valueHasMutated();
      }

      var apiKey = '840f99c1773c97cda82934bbd585ba9a';

      // retrieving 40 images
      var numImages = 40;

      var flickrUrl = "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key="+apiKey+"&text="+vm.address()+"&sort=relevance&per_page="+numImages+"&format=json&nojsoncallback=1";

      $.getJSON(flickrUrl, function(json) {

        if (json.stat == 'ok') {
          $.when(
            $.each(json.photos.photo,function(i,myresult) {

              var that = this;
              that.FlickrImage = new FlickrImage();

              that.FlickrImage.title = myresult.title;
              that.FlickrImage.url_b = 'http://farm' + myresult.farm + '.static.flickr.com/' + myresult.server + '/' + myresult.id + '_' + myresult.secret + '_b.jpg';
              that.FlickrImage.url_m = 'http://farm' + myresult.farm + '.static.flickr.com/' + myresult.server + '/' + myresult.id + '_' + myresult.secret + '_m.jpg';

              flickrImagesUnderlyingArray.push(that.FlickrImage);
            })
          )
          .done(function() {
            vm.flickrImages.valueHasMutated();

            vm.flickrImages().forEach(function(entry){
              $('.slick-images-slider').slick('slickAdd', entry.buildImage());
            })
          })
        } else {
          vm.shouldShowImagesSlider(false);
          console.log('error: ', json);
        }

      })
    }, // end function getFlickrImages

    getYelpReviews: function() {

      var yelpReviewsUnderlyingArray = vm.yelpReviews();
      if (yelpReviewsUnderlyingArray.length > 0) {
        while (yelpReviewsUnderlyingArray.length > 0) {
          $('.slick-reviews-slider').slick('slickRemove', yelpReviewsUnderlyingArray.length - 1);
          yelpReviewsUnderlyingArray.shift();
        }
        vm.yelpReviews.valueHasMutated();
      }

      var auth = {
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
      var near = vm.address();
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
          $.each(data.businesses,function(i, business) {

            var that = this;
            that.YelpReview = new YelpReview();

            that.YelpReview.imageUrl = business.image_url ? business.image_url : "img/placeholder.jpg";
            that.YelpReview.name = business.name;
            that.YelpReview.rating = business.rating;
            that.YelpReview.ratingImgUrl = business.rating_img_url;
            that.YelpReview.reviewCount = business.review_count;
            that.YelpReview.url = business.url;

            yelpReviewsUnderlyingArray.push(that.YelpReview);
          })
        },
        error: function(response) {
          vm.shouldShowReviewSlider(false);
          console.log('error: ', response);
        }
      }).done(function() {
        vm.yelpReviews.valueHasMutated();

        vm.yelpReviews().forEach(function(entry){
          $('.slick-reviews-slider').slick('slickAdd', entry.buildReview());
        })
      })

    } // end function getYelpReviews

  } // end viewModel vm

  ko.applyBindings(vm);

})
