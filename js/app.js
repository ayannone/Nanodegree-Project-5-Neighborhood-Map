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

})

