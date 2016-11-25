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

    /**
    * informe de profesores
    * @var array
    */
    private $profesores;



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

    public function robots_informes_ajax_request () {
        $this->set_user_data();

        if ( isset($_REQUEST) ) {
            $this->informes_for_current_user();
            echo  json_encode($this->response);
            wp_die();
        }

        wp_die();
    }

    private function get_colegios_zonas_in(){

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

    private function informes_for_current_user () {
        // 1. comprobar role y dependiendo ver unos u otros
        // 2. comprobar zonas de este user

        //zonas
        if($this->userZonas) $this->response['zonas'] = $this->userZonas;
        // menú
        if ( $this->is_admin() ) {
            $this->informesList = array(
                    array('name' => 'Informe','selected' => true),
                    array('name' => 'Profesores','selected' => false),
                    array('name' => 'Alumnos','selected' => false),
                    array('name' => 'Pedidos','selected' => false)
                );
        }
        $this->response['informesMenu'] = $this->informesList;
        $this->response['profesores'] = $this->get_informe_profesores();
    }

    private function get_informe_profesores () {

        $response = array();

        $clases_posts = get_posts( array(
                        "post_type" => "clases",
                        'post_status' => 'clase_activo',
                        'posts_per_page' => -1
                    )
                );

        foreach ($clases_posts as $key => $clase) {

            $clase->ID;
            $clase_meta_bruta = get_post_meta( $clase->ID );
            $colegio_id = (int) $clase_meta_bruta['clase_colegio'][0];
            $clase_inicio = $clase_meta_bruta['_clase_inicio'][0];
            $clase_fin = $clase_meta_bruta['_clase_fin'][0];
            $clase_dias_sin_clase = $clase_meta_bruta['_clase_dias_sin_clase'];
            $clase_coste = $clase_meta_bruta['_clase_coste'][0];








            $colegio_nombre = get_the_title($colegio_id);
            $colegio_zona = wp_get_post_terms( $colegio_id, 'tax_zonas', array("fields" => "all") );

            $clase_dias_recurrentes = maybe_unserialize($clase_meta_bruta['clase_semana'][0]);
            $clase_dias_recurrentes_output = array();

            foreach ($clase_dias_recurrentes as $key => $recurrentes) {
                $clase_dias_recurrentes_output[] = array(
                    'inicio' => $recurrentes['clase_semana_dias'][0],
                    'fin' => $recurrentes['clase_semana_ini'][0],
                    'dia' => $recurrentes['clase_semana_end'][0]
                );
            }

            $clase_extra_lectivos = maybe_unserialize($clase_meta_bruta['_clase_dias_extra_lectivos'][0]);
            $clase_extra_lectivos_output = array();

            foreach ($clase_extra_lectivos as $key => $extra) {
                $clase_extra_lectivos_output[] = array(
                    'inicio' => $extra['fecha'],
                    'fin' => $extra['clase_semana_ini'],
                    'dia' => $extra['clase_semana_end']
                );
            }


            $profesores = maybe_unserialize($clase_meta_bruta['_profesor_principal']);
            $profesores_output = array();

            foreach ($profesores as $key => $profe) {
                $zona_profe_id = get_user_meta($profe, '_user_zona_asignada', true);
                $zona_profe = get_term( $zona_profe_id, 'tax_zonas');
                $zona_profe_nombre = get_user_meta($profe, 'first_name', true);
                $zona_profe_apellidos = get_user_meta($profe, 'last_name', true);
                $profesores_output[] = array(
                    'id' => $profe,
                    'nombre' => $zona_profe_nombre . ' ' . $zona_profe_apellidos,
                    'zona' => array(
                                'id' => (int) $zona_profe->term_id,
                                'nombre' => $zona_profe->name,
                                'parent' => (int) $zona_profe->parent,
                            ),
                );
            }

            $profesores_sustitutos = maybe_unserialize($clase_meta_bruta['_clases_sustitutos'][0]);
            $profesores_sustitutos_output = array();

            foreach ($profesores_sustitutos as $key => $sustituto) {
                $zona_profe_id = get_user_meta($sustituto['profesor'], '_user_zona_asignada', true);
                $zona_profe = get_term( $zona_profe_id, 'tax_zonas');
                $zona_profe_nombre = get_user_meta($profe, 'first_name', true);
                $zona_profe_apellidos = get_user_meta($profe, 'last_name', true);
                $profesores_sustitutos_output[] = array(
                    'id' => (int) $sustituto['profesor'],
                    'nombre' => $zona_profe_nombre . ' ' . $zona_profe_apellidos,
                    'fecha' => $sustituto['fecha'],
                    'zona' => array(
                                'id' => (int) $zona_profe->term_id,
                                'nombre' => $zona_profe->name,
                                'parent' => (int) $zona_profe->parent,
                            ),
                );
            }

            // TODO -> calendarios clase;
            // TODO -> calendarios clase;


            $temp = array(
                        'clase' => array(
                                'id' => $clase->ID,
                                'name' => $clase->post_title,
                                'colegio_id' => $colegio_id,
                                'colegio_name' => $colegio_nombre,
                                'colegio_zona' => array(
                                        'id' => (int) $colegio_zona[0]->term_id,
                                        'nombre' => $colegio_zona[0]->name,
                                        'parent' => (int) $colegio_zona[0]->parent,
                                    ),
                                'clase_recurrentes' => $clase_dias_recurrentes_output ,
                                'clases_extra_lectivos' => $clase_extra_lectivos_output,
                                'clase_sin_clase' => $clase_dias_sin_clase ,
                                'clase_ini' => $clase_inicio,
                                'clase_fin' => $clase_fin,
                                'clase_precio' => (int) $clase_coste,
                             ),
                        'profesores' => $profesores_output,
                        'sustitutos' => $profesores_sustitutos_output
                   );

            $profesores_list = array();

            foreach ($temp as $key => $clase) {
                $profesores_clase = $clase['profesores'];

                foreach ($profesores_clase as $key => $profesor) {
                   if( $profesores_list[$profesor['id']] ){

                   }else{
                       $profesores_list[$profesor['id']] = array(
                               'meta_profe' => $profesor,
                               'clase' => $clase['clase']
                           );
                   }
                }

                // ...
            }



            array_push($response,$temp);
        }

        return $response;
    }





  //...
}

new RobotsInformesDataGenerator();
