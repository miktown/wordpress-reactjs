<?php
/**
 *
 * Informes Handler
 *
 * @package    Mimotic
 * @subpackage Informes RIA
 * @author     mimotic.com <hello@mimotic.com>
 *
 */

if ( ! defined( 'WPINC' ) ) die;

Class RobotsInformesApp {

	public function __construct () {
		 if (is_admin()) {
		 	add_filter( 'init', array( $this, 'add_menu_page' ) );
			add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_informes' ) );
		 }
	}

	public function add_menu_page () {
		add_menu_page(
			$page_title = __('App Informes'),
			$menu_title = __('App Informes'),
			$capability = 'edit_others_posts',
			$menu_slug = 'informes',
			$function = array( $this, 'callback_add_menu_page' ),
			$icon_url = 'dashicons-chart-bar',
			$position = 0
		);
	}

	public function callback_add_menu_page () {
		?> <div id="informesappria"></div> <?php
	}

	public function enqueue_informes( $hook ) {
	    if( 'toplevel_page_informes' != $hook) return;
	    wp_enqueue_script(
	    	'informesScripts',
	        plugins_url( '/app/app.js', __FILE__ ),
	        array( 'jquery' ),
	        '1.0.0',
	        true);
	   wp_enqueue_style('informesStyles', plugins_url('/app/styles.css', __FILE__));
	}

	//...
}

new RobotsInformesApp();