<?php




/**
 * Implementation of hook_views_data().
 */
function yhivemap_views_data_alter(&$data) {

  // From location module.
  $data['location']['geocoded']['title'] = 'Geocoded by javascript';
  $data['location']['geocoded']['help'] = 'Geocoded by typing Sydney etc.';
  $data['location']['geocoded']['filter']['handler'] = 'yhivemap_views_handler_filter_geocode';
  $data['location']['geocoded']['field']['handler'] = 'yhivemap_views_handler_field_geocode';

  // Hack
  $data['location']['distance']['field']['handler'] = 'yhivemap_views_handler_field_geocode';

  /*
  $data['location']['distance'] = array(
    'title' => t('Distance / Proximity'),
    'help' => t("The distance from the selected location and either the current user or a specific location."),
    'field' => array(
      'handler' => 'location_handler_field_location_distance',
      'click sortable' => TRUE,
    ),
    'sort' => array(
      'handler' => 'location_handler_sort_location_distance',
    ),
    'argument' => array(
      'handler' => 'location_handler_argument_location_proximity',
    ),
    'filter' => array(
      'handler' => 'location_views_handler_filter_proximity',
    ),
  );
  */
}

function yhivemap_views_query_alter(&$view, &$query) {

  if ($view->name = 'studio_locations') {
    $myquery = $query;

  }
}


function yhivemap_views_proximity_get_reference_location($view, $options) {
  if ($options['origin'] == 'geocode') {
    if (!empty($options['latitude']) && !empty($options['longitude'])) {
      $coordinates['latitude'] = (float) $options['latitude'];
      $coordinates['longitude'] = (float) $options['longitude'];
      return $coordinates;
    }
  }
  // Probably redundant.
  return location_views_proximity_get_reference_location($view, $options);
}
