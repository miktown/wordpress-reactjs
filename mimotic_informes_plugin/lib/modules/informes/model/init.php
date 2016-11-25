<?php
/**
 *
 * Informes Data Generator called from react by ajax
 *
 * @package    Mimotic
 * @subpackage Informes RIA
 * @author     mimotic.com <hello@mimotic.com>
 *
 */

if ( ! defined( 'WPINC' ) ) die;

Class RobotsInformesDataGenerator {


    /**
    * response
    * @var array
    */
    private $response = array();

    /**
    * roles
    * @var string | array
    */
    private $userRoles;

    /**
    * zonas
    * @var string | array
    */
    private $userZonas;

    /**
    * lista de informes disponibles
    * @var array
    */
    private $informesList;



    public function __construct () {
        if (is_admin())
            add_action( 'wp_ajax_robots_informes_ajax_request', array( $this, 'robots_informes_ajax_request' ) );
    }



    private function get_user_role () {
        global $current_user;
        return array_shift($current_user->roles);
    }

    private function get_user_zonas(){
      $user_zona = get_user_meta($this->userId, '_user_zona_asignada', true);
      $term_id = (int)$user_zona;
      $termchildren = get_term_children( $term_id, 'tax_zonas' );
      if (is_array($termchildren)) array_push($termchildren,$term_id);
      $response_names = array();
      foreach ( $termchildren as $childID ) {
        $term = get_term_by( 'id', $childID, 'tax_zonas' );
        $selected = ($childID === $term_id) ? true: false;

        $response_names[] = array('name' => $term->name, "id"=> $childID,"parentId" => $term->parent, "selected" => $selected);
      }
      return $response_names;
    }

    private function set_user_data () {
        $this->userId = get_current_user_id();
        $this->userRoles = $this->get_user_role();
        $this->userZonas = $this->get_user_zonas();
    }

    private function is_coordinador(){
        $user = wp_get_current_user();
        if ( is_array($this->userRoles) && in_array( 'coordinadorzonas', $this->userRoles )  ) return true;
        else if ( is_string($this->userRoles) && 'coordinadorzonas' === $this->userRoles ) return true;
        return false;
    }

    private function is_admin () {
        $user = wp_get_current_user();
        if ( is_array($this->userRoles) && (in_array( 'administrator', $this->userRoles ) || in_array( 'fakeadmin', $this->userRoles ) ) ) return true;
        else if ( is_string($this->userRoles) && ('administrator' === $this->userRoles || 'fakeadmin' === $this->userRoles) ) return true;
        return false;
    }

    private function informes_for_current_user () {
        // 1. comprobar role y dependiendo ver unos u otros
        // 2. comprobar zonas de este user

        if ( $this->is_admin() ) {
            $this->informesList = array(
                    array('name' => 'Informe','selected' => true),
                    array('name' => 'Profesores','selected' => false),
                    array('name' => 'Alumnos','selected' => false),
                    array('name' => 'Pedidos','selected' => false)
                );
        }

        $this->response['informesMenu'] = $this->informesList;
    }

    private function get_informe_profesores () {
        global $current_user;
        return array_shift($current_user->roles);
    }



    public function robots_informes_ajax_request () {
        $this->set_user_data();
        $this->informes_for_current_user();

        // The $_REQUEST contains all the data sent via ajax
        if ( isset($_REQUEST) ) {

            if($this->userRoles) $this->response['roles'] = $this->userRoles;
            if($this->userZonas) $this->response['zonas'] = $this->userZonas;

            $this->response['coordinador'] = $this->is_coordinador();

            $idClase= $_REQUEST['idcolegio'];
            if($idClase == 'ok'){
              $this->response['dataRecibida'] = $idClase;
            }

            // Now we'll return it to the javascript function
            // Anything outputted will be returned in the response
            echo  json_encode($this->response);

            wp_die(); // this is required to terminate immediately and return a proper response

            // If you're debugging, it might be useful to see what was sent in the $_REQUEST
            // print_r($_REQUEST);
        }

        // Always die in functions echoing ajax content
        wp_die();
    }

  //...
}

new RobotsInformesDataGenerator();
