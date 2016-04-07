(function ($) {

  Drupal.behaviors.YhiveMap = {};

  Drupal.behaviors.YhiveMap.attach = function () {
    if (Drupal.settings && Drupal.settings.views && Drupal.settings.views.ajaxViews) {
      jQuery.each(Drupal.settings.views.ajaxViews, function (i, settings) {
        Drupal.yhivemaps[i] = new Drupal.YhiveMap(i, settings);
        console.log(settings.view_dom_id);
      });
    }
  };

  Drupal.yhivemaps = {};

  Drupal.YhiveMap = function (i, settings) {
    this.selector = '.view-dom-id-' + settings.view_dom_id;
    this.$view = $(this.selector);
    this.settings = settings;

    // Run it first time only.  Limits us to only one map per page.
    // Gmap won't draw an empty map.
    if (typeof Drupal.yhivemaps[i] == 'undefined') {
      this.initialise();
    }
  };

  Drupal.YhiveMap.prototype.initialise = function () {
    var yHiveMap = this;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        jQuery('[name="geocoded[latitude_geo]"]').val(position.coords.latitude);
        jQuery('[name="geocoded[longitude_geo]"]').val(position.coords.longitude);
 //       jQuery(yHiveMap.selector).triggerHandler('RefreshView');

        //     var initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
   //     map.map.setCenter(initialLocation);
// map.vars.zoom
//        map.map.setZoom(12);
      });
    }

  //  jQuery('[name="geocoded[latitude_geo]"]').val('22');
   // jQuery('[name="geocoded[longitude_geo]"]').val('1');

  };


})(jQuery);