<?php

/**
 * @file
 * General proximity filter for location latitude/longitude.
 */
// @codingStandardsIgnoreStart
class yhivemap_views_handler_filter_geocode extends location_views_handler_filter_proximity {
  /**
   * {@inheritdoc}
   */
  public function option_definition() {
    $options = parent::option_definition();

    $options['value']['default']['latitude_geo'] = 0;
    $options['value']['default']['longitude_geo'] = 0;

    $options['origin'] = array('default' => 'geocode');
    $options['value']['default']['search_units'] = 'km';

    return $options;
  }

  /**
   * {@inheritdoc}
   */
  public function value_form(&$form, &$form_state) {
    // It's vital you call the parent function so that the rest
    // of the handler default settings are initiated correctly.
    parent::value_form($form, $form_state);
    // Now you can add your option with a default value.
    $form['origin']['#options']['geocoded'] = 'Javascript geocoded input';


    // Latitude & Longitude as hidden fields
    //  $form['value']['latitude']['#type'] = 'hidden';
    $form['value']['latitude']['#dependency']['edit-options-origin'][] = 'geocoded';
    $form['value']['latitude']['#type'] = 'hidden';
    $form['value']['longitude']['#type'] = 'hidden';
    $form['value']['user_location_delta']['#type'] = 'hidden';
    $form['value']['search_distance']['#type'] = 'hidden';
    $form['value']['search_units']['#type'] = 'hidden';

    $form['value']['latitude_geo'] = array(
      '#type' => 'textfield',
      '#title' => t('Latitude'),
      '#default_value' => $this->value['latitude_geo'],
      '#weight' => 9,
    );

    $form['value']['longitude_geo'] = array(
      '#type' => 'textfield',
      '#title' => t('Longitude'),
      '#default_value' => $this->value['longitude_geo'],
      '#weight' => 9,
    );

  }


  public function exposed_form(&$form, &$form_state) {
    parent::exposed_form($form, $form_state);
  }

  public function query() {
    if (empty($this->value)) {
      return;
    }

    $this->ensure_my_table();

    // Also $this->value['latitude_geo']
    // Try - this->value['latitude_geo']
    $lat = $this->view->exposed_raw_input['geocoded']['latitude_geo'];
    $lon = $this->view->exposed_raw_input['geocoded']['longitude_geo'];
 //   $lat = $this->options['value']['latitude_geo'];
 //   $lon = $this->options['value']['longitude_geo'];

    $this->options['value']['latitude'] = $lat;
    $this->options['value']['longitude'] = $lon;

    $distance_meters = _location_convert_distance_to_meters(
      $this->value['search_distance'],
      $this->value['search_units']
    );
    $latrange = earth_latitude_range($lon, $lat, $distance_meters);
    $lonrange = earth_longitude_range($lon, $lat, $distance_meters);

    // Add MBR check (always).
    // In case we go past the 180/-180 mark for longitude.
    if ($lonrange[0] > $lonrange[1]) {
      $where = "$this->table_alias.latitude > :minlat AND $this->table_alias.latitude < :maxlat AND (($this->table_alias.longitude < 180 AND $this->table_alias.longitude > :minlon) OR ($this->table_alias.longitude < :maxlon AND $this->table_alias.longitude > -180))";
    }
    else {
      $where = "$this->table_alias.latitude > :minlat AND $this->table_alias.latitude < :maxlat AND $this->table_alias.longitude > :minlon AND $this->table_alias.longitude < :maxlon";
    }
    $this->query->add_where_expression(
      $this->options['group'],
      $where,
      array(
        ':minlat' => $latrange[0],
        ':maxlat' => $latrange[1],
        ':minlon' => $lonrange[0],
        ':maxlon' => $lonrange[1]
      )
    );

    if ($this->operator == 'dist') {
      // Add radius check.
      $this->query->add_where_expression(
        $this->options['group'],
        earth_distance_sql($lon, $lat, $this->table_alias) . ' < :distance',
        array(':distance' => $distance_meters)
      );
    }
  }


}
// @codingStandardsIgnoreEnd