
function loadData() {

    var $body = $('body');
    var $wikiElem = $('#wikipedia-links');
    var $nytHeaderElem = $('#nytimes-header');
    var $nytElem = $('#nytimes-articles');
    var $greeting = $('#greeting');

    // clear out old data before new request
    $wikiElem.text("");
    $nytElem.text("");

    // load streetview

    var street = $('#street').val();
    var city = $('#city').val();
    var location = street + ", " + city;
    var size = "600x400";
    var urlGoogleMapsSV = "http://maps.googleapis.com/maps/api/streetview?size="+size+"&location=\""+location+"\"";
    var img = '<img class="bgimg" src='+urlGoogleMapsSV+'/>';
    $greeting.text('So, you want to live in ' + location + '?');
    $body.append(img);

    // load NYT articles
    // URI Structure:
    // http://api.nytimes.com/svc/search/v2/articlesearch.response-format?[q=search term&fq=filter-field:(filter-term)&additional-params=values]&api-key=####
    var APIkey = "758126d6f4468a918478cde39ec30e73:1:72262469"; // Article Search API key
    var baseURI = "http://api.nytimes.com/svc/search/v2/articlesearch";
    var responseFormat = ".json";
    var searchQuery = "q="+location+"&fq=source:(\"The New York Times\")";
    var urlNYT = baseURI + responseFormat + "?" + searchQuery + "&sort=newest" + "&api-key=" + APIkey;

    $.getJSON(urlNYT, function(data) {
        $nytHeaderElem.text("New York Times Articles about " + location);
        articles = data.response.docs;

        for (var i=0; i < articles.length; i++) {
            var article = articles[i];
            $nytElem.append(
                '<li class="article">' +
                '<a href="'+article.web_url+'">'+article.headline.main+'</a>' +
                '<p>'+article.snippet+'</p>' +
                '</li>'
            );
        }
    }).error(function(e) {
        $nytHeaderElem.text('New York Times Articles Could Not Be Loaded');
    });

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

    var wikiUrl = "http://en.wikipedia.org/w/api.php?action=opensearch&format=json&callback=?&search="+city;

    // var wikiRequestTimeout = setTimout(function(){
    //     $wikiElem.text("failed to get Wikipedia articles");
    // }, 8000);

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
            // clearTimeout(wikiRequestTimeout);
        }
    });

    return false;
};

$('#form-container').submit(loadData);

// loadData();
