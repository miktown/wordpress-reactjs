<?php
/*
Plugin Name: Informes RIA
Plugin URI:  http://mimotic.com
Description: Informes RIA - made on react.js by mimotic.com
Version:     1.0.0
Author:      Mimotic
Author URI:  http://mimotic.com
License:     GPL2
License URI: https://www.gnu.org/licenses/gpl-2.0.html
Domain Path: /languages
Text Domain: mimoticinformes

Robots Plugin is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 2 of the License, or
any later version.

Informes RIA is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Robots Plugin. If not, see https://www.gnu.org/licenses/gpl-2.0.html.
*/

/*
 *	If this file is called directly, abort.
 */
if ( ! defined( 'WPINC' ) ) die;

/*
 *	Sets initial loading deps
 */
if ( ! class_exists('Mimotic_appStart', false) && file_exists( __DIR__ . '/lib/MimoticApp.php' ))
	  require_once  __DIR__ . '/lib/MimoticApp.php';

$mimoticInformes_deps = array(
	"lib/modules/informes/init",
	"lib/modules/informes/model/init"
);

new Mimotic_appStart($mimoticInformes_deps);
