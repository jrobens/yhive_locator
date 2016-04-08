(function ($) {

  Drupal.behaviors.YhiveMap = {};

  Drupal.behaviors.YhiveMap.attach = function () {
    // Ajax does not work with gmap.
    if (Drupal.settings && Drupal.settings.views && Drupal.settings.views.ajaxViews) {
      jQuery.each(Drupal.settings.views.ajaxViews, function (i, settings) {
        Drupal.yhivemaps[i] = new Drupal.YHiveMap(i, settings);
        console.log(settings.view_dom_id);
      });
    }
    /*
     google.maps.event.addListenerOnce(map, 'idle', function(){
     alert("Map is loaded!");
     });
     */

    // Debug.

    if (Drupal.settings) {
      console.log("non-ajax views");

      var old_lat = jQuery('[name="geocoded[latitude_geo]"]').val();
      var old_lon = jQuery('[name="geocoded[longitude_geo]"]').val();
      $('.form-item-geocoded-user-location-delta').hide();

      $('<p>'+ old_lat + '</p>').appendTo('.page-header');
      $('<p>'+ old_lon + '</p>').appendTo('.page-header');

      // First load of the page. Too bad if you live at 0 0.
      // The map will not display in this case as there are no records near here.
      if (navigator.geolocation && old_lat == 0 && old_lon == 0) {
        navigator.geolocation.getCurrentPosition(function (position) {
          jQuery('[name="geocoded[latitude_geo]"]').val(position.coords.latitude);
          jQuery('[name="geocoded[longitude_geo]"]').val(position.coords.longitude);
          $('#views-exposed-form-studio-locations-page').submit();
        //  jQuery('#edit-submit-studio-locations').click();
        });
      } else {

        /*
         $("#gmap-auto1map-gmap0").bind("DOMSubtreeModified", function() {
         console.log("tree changed");
         });   */

        var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

        var observer = new MutationObserver(function (mutations, observer) {
          var target_id = mutations[0].target.id;
          var map = Drupal.gmap.getMap(target_id).map;

          // Not the same settings.
          Drupal.yhivemaps[target_id] = new Drupal.YHiveMap(target_id, Drupal.settings);

          if (typeof map != 'undefined') {
            // Old because we just refreshed the page and it will not be changed.
            var initialLocation = new google.maps.LatLng(old_lat, old_lon);
            map.setCenter(initialLocation);
            // map.vars.zoom
            map.setZoom(12);
          }
        });

        jQuery(".gmap").each(function () {
          var gmapID = jQuery(this).attr("id");

          observer.observe($("#" + gmapID)[0], {
            subtree: false,
            attributes: true
          });
        });


        // Perversely add a search text box and apply button.
        $('<input class="" type="text" id="enter-placename-text" name="enter-placename-text" placeholder="enter place name" value="" size="60" maxlength="16">').insertBefore('#views-exposed-form-studio-locations-page');
        $('<button class="btn btn-info form-submit" type="submit" id="enter-placename-btn" name="" value="Apply">Apply</button>').insertBefore('#views-exposed-form-studio-locations-page');
      //  $('.views-submit-button').hide();
     //   $('#edit-reset').hide();
        $('#edit-geocoded-wrapper').find('> label').hide();

        // Not inside the form. Drupal gets upset.
        $('#enter-placename-btn').one("click", function(e) {
          e.preventDefault();

          var placename_value = $('#enter-placename-text').val();
          console.log('submitted ' + placename_value);

          // Only use the first map. Not sure why yhivemaps are an object rather than array.
          // No map - make one. Should not happen.
          var yhivemap = Drupal.yhivemaps[Object.keys(Drupal.yhivemaps)[0]];
          if (typeof yhivemap == 'undefined') {
            var firstGmapId = jQuery(".gmap").first().attr("id");
            yhivemap = new Drupal.YHiveMap(firstGmapId, Drupal.settings);
            Drupal.yhivemaps[firstGmapId] = yhivemap;
          }

          // Still no map?
          if (typeof yhivemap != 'undefined') {
            try {
              yhivemap.geocode(placename_value);
              //jQuery('#edit-submit-studio-locations').click();
             // $('#views-exposed-form-studio-locations-page').submit();
            } catch (e) {
              console.log(e.message);
              return false;
            }

            //this.submit();
          }
      });

        $(window).on('gMapsLoaded', function() {
          // May not be the first one?
          var yhivemap = Drupal.yhivemaps[Object.keys(Drupal.yhivemaps)[0]];
          var addressString = yhivemap.checkAddressString;
          yhivemap.geocode(addressString );
         jQuery('#edit-submit-studio-locations').click();
          //$('#views-exposed-form-studio-locations-page').submit();
        });

        /*
        $('#enter-placename-btn').click(function (e) {
          e.preventDefault();
          var placename_value = $('#enter-placename-text').val();
          console.log('clicked ' + placename_value);

          // Only use the first map. Not sure why yhivemaps are an object rather than array.
          var yhivemap = Drupal.yhivemaps[Object.keys(Drupal.yhivemaps)[0]];
          yhivemap.setMap();
          yhivemap.geocode(placename_value);
        });
        */

      }
    }

    Drupal.yhivemaps = {};

    Drupal.YHiveMap = function (i, settings) {
      // The map id.
      this.id = i;

      if (settings.view_dom_id) {
        this.selector = '.view-dom-id-' + settings.view_dom_id;
      }
      this.$view = $(this.selector);
      this.settings = settings;

      // Run it first time only.  Limits us to only one map per page.
      // Gmap won't draw an empty map.
      if (typeof Drupal.yhivemaps[i] == 'undefined') {
        //   this.initialise();
      }
    };

    Drupal.YHiveMap.prototype.setMap = function () {
      // Drupal gmaps container. use map.map to get the real map.
      // TODO try/catch
      this.gmap = Drupal.gmap.getMap(this.id);
    };

    // TODO Ajax does not work with gmaps.
    /**
     * @deprecated ajax does not work with gmaps.
     */
    Drupal.YHiveMap.prototype.initialise = function () {
      var yHiveMap = this;

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
          jQuery('[name="geocoded[latitude_geo]"]').val(position.coords.latitude);
          jQuery('[name="geocoded[longitude_geo]"]').val(position.coords.longitude);
        });
      }
    };

    var gMapsLoaded = true;
    window.gMapsCallback = function(){
      gMapsLoaded = true;
      $(window).trigger('gMapsLoaded');
    };

    // Review more here http://stackoverflow.com/questions/3922764/load-google-maps-v3-dynamically-with-ajax
    Drupal.YHiveMap.prototype.checkGmap = function() {
       $.getScript("https://maps.googleapis.com/maps/api/js?sensor=false&async=2&callback=gMapsCallback", function(){});
    };

    Drupal.YHiveMap.prototype.geocode = function (address_string) {
      var yHiveMap = this;

      var version;
      try {
        version = google.maps.version;
      } catch (e) {
        gMapsLoaded = false;
        yHiveMap.checkAddressString = address_string;
        yHiveMap.checkGmap();
        throw "No gmaps, loading.";
      }

      // google is not defined. No Map, then the javascript is not loaded. gmaps - over-optimising.
      if (version !== 'undefined') { // assume Google Maps API v3 as API v2 did not have this variable
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({'address': address_string}, function (results, status) {
          if (status == google.maps.GeocoderStatus.OK) {
            // Set the location and submit the form. We need to search for the results.
            var lat = results[0].geometry.location.lat();
            var lon = results[0].geometry.location.lng();
            jQuery('[name="geocoded[latitude_geo]"]').val(lat);
            jQuery('[name="geocoded[longitude_geo]"]').val(lon);
            jQuery('#enter-placename-text').val(results[0].geometry.location.formatted_address);

            /*
            yHiveMap.gmap.locpick_coord = results[0].geometry.location;
            yHiveMap.gmap.change('locpickchange');
            yHiveMap.gmap.map.setCenter(results[0].geometry.location);
            yHiveMap.gmap.map.setZoom(14);
            */
          }
          else {
            alert(Drupal.t("Your address was not found."));
            throw "Your address was not found. " + status;
          }
        });
      }
      else {
        // Waste of script - never going to fall back to this.
        geocoder = new GClientGeocoder();
        geocoder.reset(); // Clear the client-side cache
        geocoder.getLatLng(address_string, function (point) {
          if (!point) {
            alert(Drupal.t("Your address was not found."));
          }
          else {
            var m = Drupal.gmap.getMap(gmap_id);
            m.locpick_coord = point;
            m.change('locpickchange');
            m.map.setCenter(point, 14);

          }
        });
      }
    };

  }

})(jQuery);