<?php
/**
 * Returns user role
 * @return user_role is is logged or false if not
 **/
function get_robotsapp_helper_current_user_role() {

	$user_roles = array();
	$user_role = false;

	if ( is_user_logged_in() ) {
	  global $current_user;
	  $user_roles = $current_user->roles;
	  $user_role = array_shift($user_roles);
	}else{
		$user_role = false;
	}
	return $user_role;
}


/**
 * Returns user role
 * @return user_role is is logged or false if not
 **/
function get_robotsapp_helper_user_role($user_id) {
	global $wpdb, $user;
	return $output;
}


/**
 *
 * devuelve mapeado la user meta en un array
 *
 **/
function get_robotsapp_helper_usermeta_mapped($user_id){
	global $wpdb;
	// coger toda la metadata del cliente $user_id
	$meta = get_user_meta( $user_id );
	$meta2 = get_userdata( $user_id );

	if( $meta == false) return false;
	// mapear array $meta
	$meta = array_filter( array_map( function( $a ) {
		return $a[0];
	}, $meta ) );

	$meta['roles'] = maybe_unserialize($meta[$wpdb->prefix . "capabilities"]);
	$meta['mail'] = $meta2->user_email;

	unset($meta[$wpdb->prefix . "capabilities"]);
	unset($meta[$wpdb->prefix . "capabilities_log"]);
	unset($meta["admin_color"]);
	unset($meta["show_admin_bar_front"]);
	unset($meta["comment_shortcuts"]);
	unset($meta["rich_editing"]);

	return $meta;
}


/**
 *
 * Comprobar el rol
 * @param id del usuario
 * @param   $role el role a comparar
 * @return  bool
 *
 **/
function is_user_this_role($role, $user_id){

	global $wpdb;
	$response = false;
	$all_user_roles = false;

	// coger toda la metadata $user_id
	$meta = get_user_meta( $user_id );

	if($meta != false){
		// mapear array $meta
		$meta = array_filter( array_map( function( $a ) {
			return $a[0];
		}, $meta ) );

		$all_user_roles = maybe_unserialize($meta[$wpdb->prefix . "capabilities"]);
	}

	if($all_user_roles != false){
		foreach ($all_user_roles as $key => $value)
			if ($key === $role) $response = true;
	}

	return $response;
}

/**
 *
 * mapeado de un array
 *
 **/
function robotsapp_map_array($data){
  $response = array_filter( array_map( function( $a ) {
    return $a[0];
  }, $data ) );
  return $response;
}

/**
 * Formating Look Dates or String Dates
 * @param  (Date|String) $old [required, date to format]
 * @param  string $format - optional, default Wordpress Format
 * @return (0|False|Date) - Date formated
 */
function robotsapp_date_converter( $old , $format = "Y-m-d H:i:s" ){

	$old_date = date($old);
	$old_date_timestamp = strtotime($old_date);
	$new_date_format = date( $format , $old_date_timestamp);

  	return $new_date_format;

  	//...
}



/**
 * Print clean title separator
 * @param  (String) $title [ optional - text to print out - else separator]
 * @param  string $format - optional, default Wordpress Format
 * @return void
 */
function robotsapp_title( $title = false , $class = ''){

	$output = false;

	$output = '<div class="clean-line"></div>';
	if($title !== false) $output .= '<h3 class="mimotitle ' . $class . '"> → ' . $title . '</h3>';

  	echo $output;

  	//...
}
if(!function_exists('debugl')) {
	function debugl($strg){
		echo '<pre>';
		print_r($strg);
		echo '</pre>';
	}
}

function debug($strg, $sub = "", $url = ""){
	if ($url == "") $url = "/Users/imike/Desktop";
	$f = fopen("$url/debug$sub.txt", "w");
	fwrite($f, print_r($strg, true));
	fclose($f);
}
function debug2($strg, $sub = "", $url = ""){
	return false;
        $timestamp=date("d-m-y H:i:s - ");
	if ($url == "") $url = "/home/scarrizo/Desktop";
	file_put_contents($url, $timestamp.$strg.PHP_EOL , FILE_APPEND);
}
function mimotic_array_reindex($the_array){
	$unico_reorder = array();
    foreach ($the_array as $key => $value) {
        $unico_reorder[] = $value;
    }
    return $unico_reorder;
}
function mimotic_array_clean_empty($the_array){
	$unico_reorder = array();
    foreach ($the_array as $key => $value) {
    	if($value) $unico_reorder[] = $value;
    }
    return $unico_reorder;
}
function mimotic_array_uniq($the_array){
	$unico_reorder = array();
	$unico = array();

	$unico = array_unique($the_array);
    foreach ($unico as $key => $value) {
        if((int) $value > 0) $unico_reorder[] = $value;
    }
    return $unico_reorder;
}
function is_coordinador(){
	$user = wp_get_current_user();
	if ( in_array( 'coordinadorzonas', (array) $user->roles ) ) {
	    return true;
	}
    return '';
}
function get_user_zona(){

  $user_zona = get_user_meta(get_current_user_id(), '_user_zona_asignada', true);
  $term_id = (int)$user_zona;

  return $term_id;
}
function get_user_zonas($tipo = false){

  $user_zona = get_user_meta(get_current_user_id(), '_user_zona_asignada', true);
  $term_id = (int)$user_zona;

  $termchildren = get_term_children( $term_id, 'tax_zonas' );
  if (is_array($termchildren)) array_push($termchildren,$term_id);


  if(!$tipo){
  	$response_names = array();
  	foreach ( $termchildren as $child ) {
	    $term = get_term_by( 'id', $child, 'tax_zonas' );
	    $response_names[$child ] = $term->name;
  	}
  }else{
  	$response_names = '';
  	foreach ( $termchildren as $key => $child ) {
	    $term = get_term_by( 'id', $child, 'tax_zonas' );
	    if($key == 0) $response_names .= $child;
	    else $response_names .= ',' . $child;
  	}
  }
  return $response_names;
}
function get_colegios_zonas_in(){

  $ids_colegios = array();
  $zona_del_coordinador = get_user_zona();

  $related = get_posts(array(
      'post_type' => 'colegios' // Set post type you are relating to.
      ,'posts_per_page' => -1
      ,'post_status' => 'publish'
      ,'orderby' => 'post_title'
      ,'order' => 'ASC'
      ,'suppress_filters' => false // This must be set to false
      ,'tax_query' => array(
          array(
            'taxonomy' => 'tax_zonas',
            'field' => 'id',
            'terms' => $zona_del_coordinador,
            'include_children' => true,
          )
        )
  ));
  foreach ($related as $key => $value) {
  	$ids_colegios[] = (int)$value->ID;
  }
  return $ids_colegios;
}