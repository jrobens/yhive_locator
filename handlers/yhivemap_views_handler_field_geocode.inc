<?php

/**
 * @file
 * Coordinates field handler.
 */

// @codingStandardsIgnoreStart
// Not sure this is the correct parent. Possibly location
class yhivemap_views_handler_field_geocode extends location_handler_field_location_distance {
  /**
   * {@inheritdoc}
   */
  public function query() {
    $this->ensure_my_table();

    if (array_key_exists('geocoded', $this->view->exposed_input)) {
      $this->options['latitude'] = $this->view->exposed_input['geocoded']['latitude_geo'];
      $this->options['longitude'] = $this->view->exposed_input['geocoded']['longitude_geo'];
      $this->options['origin'] = 'geocode';
    }

    $coordinates = yhivemap_views_proximity_get_reference_location($this->view, $this->options);

    if (!empty($coordinates)) {
      $this->field_alias = $this->query->add_field(
        NULL,
        earth_distance_sql($coordinates['longitude'], $coordinates['latitude'], $this->table_alias),
        $this->table_alias . '_' . $this->field
      );
    }
    else {
      $this->field_alias = $this->query->add_field(NULL, "'Unknown'", $this->table_alias . '_' . $this->field);
    }
  }
}
// @codingStandardsIgnoreEnd
