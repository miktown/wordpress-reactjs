<?php
/**
 * Inyección de Dependencias PHP style.
 *
 * @package Mimotic
 * @subpackage Informes RIA
 * @author mimotic.com <hello@mimotic.com>
 * @version 0.2.0
 *
 */

if ( ! defined( 'WPINC' ) ) die;

class Mimotic_appStart{

	/**
	 * @var array
	 */
	private $libs;

	/**
	 * @var string
	 */
	private $pluginUrl = null;

	public function __construct($loadMore = "", $pluginUrl = "" ) {
		if ($pluginUrl) $this->pluginUrl = $pluginUrl;
		if ($loadMore) $this->start($loadMore);
    }

	/**
	 * recorre array
	 * @param  array $deps mount list of deps to set
	 * @return void
	 */
	private function callDeps($deps){
		if($this->pluginUrl === null)
			$this->pluginUrl = dirname( dirname(__FILE__));

		foreach ($deps as $valor)
			$this->setDeps($valor);
	}

	/**
	 * set deps requieres
	 * @param string $dir
	 * @return  void
	 */
	private function setDeps($dir){
		if ( file_exists(  $this->pluginUrl . "/$dir.php" ) )
			require_once  $this->pluginUrl . "/$dir.php";
	}

	/**
	 * set default libs
	 * @param  void
	 * @return void
	 */
	private function setDefaultDeps(){
		$this->libs = array(
				 "helpers/helpers"
			);
	}

	/**
	 * starts de deps calls to plugin runs
	 * @param  array (opcional)
	 * @return void
	 */
	private function start($loadMore = ""){
		$this->setDefaultDeps();

		if($loadMore !== "")
			$this->libs = array_merge($this->libs, $loadMore);

		$this->callDeps($this->libs);
	}

	//..
}