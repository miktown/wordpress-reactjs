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

    /**
    * informe de piezas
    * @var array
    */
    private $piezas = array();

    /**
    * colegios
    * @var array
    */
    private $colegios = array();

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
        $this->userId = get_current_user_id(); // wp->fn
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

        //zonas
        if($this->userZonas) $this->response['zonas'] = $this->userZonas;
        // menú
        if ( $this->is_admin() ) {
            $this->informesList = array(
                    array('name' => 'Totales','selected' => false),
                    array('name' => 'Informe','selected' => true),
                    array('name' => 'Nóminas','selected' => false),
                    array('name' => 'Piezas','selected' => false),
                    array('name' => 'Pedidos','selected' => false),
                    array('name' => 'Passwords','selected' => false),
                    array('name' => 'Colegios','selected' => false),
                    array('name' => 'Alumnos','selected' => false),
                    array('name' => 'Asistencia','selected' => false),
                    array('name' => 'Profesores','selected' => false),

                );
        }
        $this->response['informesMenu'] = $this->informesList;
        $this->response['horas'] = $this->get_informe_profesores();
        $this->response['pedidos'] = $this->get_informe_pedidos();
        $this->response['piezas'] = $this->get_informe_piezas();
        $this->response['passwords'] = $this->get_informe_passwords();
        $this->response['colegios'] = $this->get_informe_colegios();
        $this->response['alumnos'] = $this->get_informe_alumnos();
    }

    /**
     * Obtener piezas del pedido
     * @param  [array] $lectivos
     * @return [array|false]
     */
    private function get_informe_colegios(){
        $response = array();
        $siteUrl = get_site_url();

        $colegios = get_posts( array(
                    "post_type" => "colegios",
                    "posts_per_page"   => -1,
                    "post_status" => 'published',
                    "orderby" => 'post_title',
                    "order" => 'ASC'
                ));

        foreach ($colegios as $colegio) {
            $url = $siteUrl . '/wp-admin/post.php?post=' . $colegio->ID . '&action=edit';
            $tipo = get_post_meta($colegio->ID, 'cold_tipo', true); // provado, concertado, publico

            $colegio_zona = wp_get_post_terms( $colegio->ID, 'tax_zonas', array("fields" => "all") );

            $response[] = array(
                "id" => $colegio->ID,
                "url" => $url,
                "nombre" => $colegio->post_title,
                "tipo" => $tipo,
                'zona' => array(
                        'id' => (int) $colegio_zona[0]->term_id,
                        'nombre' => $colegio_zona[0]->name,
                        'parent' => (int) $colegio_zona[0]->parent,
                    )
            );
        }

        $this->colegios = $response;

        return $response;
    }

    private function getClases ($alumno_id, $colegio_id, $clases) {

        // foreach ($clases as $key => $value) {

        // }

        $clases = get_posts( array(
                    "post_type" => "clases",
                    "posts_per_page"   => -1,
                    "post_status" => 'activo',
                    "orderby" => 'post_title',
                    "order" => 'ASC'
                ));

        return $clases;
    }

    private function comprobar_si_sigue_alli($id_asignatura,$id_clase_in){
      global $post;
      $output = false;
      $output2 = false;
      $output3 = false;

      $post->ID; // alumno
      $id_asignatura; // asignatura
      $id_clase_in; // clase
      $is_clase_activa = get_post_status($id_clase_in);

      // 0 - compobar que la clase esté activa.
      if( $is_clase_activa != 'clase_activo') return false;

      // comprobar que el alumno está en esa clase:
      // 1.- comprobar que en esa clase está su mismo colegio

      $col_alumno = get_post_meta($post->ID,'_colegio_asociado_alumno');
      $col_clase = get_post_meta($id_clase_in,'clase_colegio');

      if((int)$col_alumno[0] === (int)$col_clase[0]) $output = true;


      // 2.- comprobar que en esa clase está esa asignatura
      if($output){

        $asignaturas_clase = get_post_meta($id_clase_in,'clase_asignaturas',false);

        foreach ($asignaturas_clase as $key => $value) {
          if((int)$value === (int)$id_asignatura) $output2 = true;
        }
      }



      // 3.- comprobar que en esa clase y asignatura sigue estando este alumno
      // if($output && $output2){
      //   $asignaturas_clase = get_post_meta($post->ID,'clase_asignaturas',false);
      //   foreach ($asignaturas_clase as $key => $value) {
      //     if((int)$value[0] === (int)$id_asignatura) $output3 = true;
      // }

      if($output && $output2) return true;
      else return false;
    }

    private function isClaseActiva($claseId){
        return (get_post_status($claseId) === 'clase_activo');
    }

    private function isActivaAsignaturaInClass($clase_id,$asignatura_id){

        $asignaturas_clase = get_post_meta($clase_id, 'clase_asignaturas', false);

        foreach ($asignaturas_clase as $asignatura) {
            if((int)$asignatura === (int)$asignatura_id) return true;
        }

        return false;
    }

    private function isAlumnoOnAsignaturaClaseList ($clase_id, $asignatura_id, $alumno_id) {

        $alumnos_asignatura = get_post_meta($clase_id, 'clase_alumnos_' . $asignatura_id, false);

        foreach ($alumnos_asignatura[0]['alumnos'] as $alumno)
            if((int)$alumno === (int)$alumno_id) return true;

        return false;
    }


    private function cleanClases($clases, $alumno_id){

        $response = array();

        foreach ($clases as $clase) {
            $clase_id = $clase['clase'];
            $asignatura_id = $clase['asignatura'];

            // 0 - comprobamos si la clase esta activa
            $isClaseActiva = $this->isClaseActiva($clase_id);
            if( $isClaseActiva === false) continue;

            // 1- comprobamos que sendos colegios asociados son los mismos
            //    tanto en alumno como en la clase
            $colegio_alumno = get_post_meta($alumno_id,'_colegio_asociado_alumno',true);
            $colegio_clase = get_post_meta($clase_id,'clase_colegio',true);
            if((int)$colegio_alumno !== (int)$colegio_clase) continue;

            // 2- comprobar que la asignatura está activa en la clase
            $isActivaAsignatura = $this->isActivaAsignaturaInClass($clase_id, $asignatura_id);
            if($isActivaAsignatura === false) continue;

            // 3.- comprobar que esta ahora en la clase.
            $isAlumnoInList = $this->isAlumnoOnAsignaturaClaseList($clase_id, $asignatura_id, $alumno_id);
            if($isAlumnoInList === false) continue;

            // RESULTADO, si todo ok
            // Añadimos a la respuesta completando metadata de la clase
            $clase['name'] = get_the_title( $clase_id);
            $clase['asignaturaname'] = get_the_title( $asignatura_id);
            $clase['url'] = $siteUrl . '/wp-admin/post.php?post=' . $clase_id . '&action=edit&_%5Bflow%5D=clasesflow&_%5Bflow_page%5D=alumnos';
            $profesores_ids = get_post_meta( $clase_id, '_profesor_principal', false );
            $profes = array();
            foreach ($profesores_ids as $profe_id) {
                $temp_profe_metadata = get_userdata( $profe_id );
                $profes[] = array(
                    'id' => $profe_id,
                    'name' =>$temp_profe_metadata->display_name
                );
            }
            $clase['profesores'] = $profes;

            // añadimos a la response
            $response[] = $clase;
        }

        return $response;

    }

    /**
     * @param  [array] $lectivos
     * @return [array|false]
     */
    private function get_informe_alumnos(){
        $response = array();
        $siteUrl = get_site_url();

        //obtener todas las clases
        $clases_all = get_posts( array(
                    "post_type" => "clases",
                    "posts_per_page"   => -1,
                    "post_status" => 'clase_activo',
                    "orderby" => 'post_title',
                    "order" => 'ASC'
                ));

        //obtener todos los alumnos
        $alumnos = get_posts( array(
                    "post_type" => "alumnos",
                    "posts_per_page"   => -1,
                    "post_status" => 'activo',
                    "orderby" => 'post_title',
                    "order" => 'ASC'
                ));

        // recorremos alumnos
        foreach ($alumnos as $alumno) {



            $url = $siteUrl . '/wp-admin/post.php?post=' . $alumno->ID . '&action=edit';
            $colegio_id = get_post_meta($alumno->ID,'_colegio_asociado_alumno',true);
            $colegio_zona = wp_get_post_terms( $colegio_id, 'tax_zonas', array("fields" => "all") );
            $colegio_nombre = get_the_title($colegio_id);
            $no_asistencia = get_post_meta($alumno->ID, 'alumno_noasistencia', false);

            $curso_edad_nivel = wp_get_post_terms( $alumno->ID, 'tax_cursos', array("fields" => "all") );

            $clases_alumno_bruto = get_post_meta($alumno->ID,'_clase_in',false);

            $clases_alumno_bruto = $this->array_unique_multidimensional($clases_alumno_bruto);

            $clases_alumno = $this->cleanClases($clases_alumno_bruto,$alumno->ID);

            $response[] = array(
                "id" => $alumno->ID,
                "url" => $url,
                "nombre" => $alumno->post_title,
                "bajas" => $no_asistencia,
                "clases" => $clases_alumno,
                "profesores" => $profesores,
                "curso" => array(
                    "id" => (int) $curso_edad_nivel[0]->term_id,
                    "nombre" => $curso_edad_nivel[0]->name,
                ),
                "colegio" => array(
                    "id" => $colegio_id,
                    "nombre" => $colegio_nombre
                ),
                "zona" => array(
                        "id" => (int) $colegio_zona[0]->term_id,
                        "nombre" => $colegio_zona[0]->name,
                        "parent" => (int) $colegio_zona[0]->parent,
                    )
            );
        }

        $response = array(
            'alumnos' => $response,
            'colegios' => $this->colegios
        );

        return $response;
    }

    private function array_unique_multidimensional($main_array) {

        $response = array();
        $temp = array();

        foreach ($main_array as $value) {
            $temp[] = $value['asignatura'] . $value['clase'];
        }

        $temp = array_unique($temp);

        foreach ($temp as $key => $value) {
            $response[] = $main_array[$key];
        }

        return $response;
    }

     /**
     * Obtener piezas del pedido
     * @param  [array] $lectivos
     * @return [array|false]
     */
    private function get_informe_piezas(){
        $response = false;
        foreach ($this->piezas as $pieza) {
           $response[] = $pieza;
        }
        return $response;
    }

     /**
     * Obtener piezas del pedido
     * @param  [array] $lectivos
     * @return [array|false]
     */
    private function get_piezas($arr){

        $ids = array();
        $response = false;
        $piezas = false;
        $cantidad = array();
        $temp_in = false;
        $img_url = false;

        foreach ($arr as $key => $value) {

            $ids[] = $value['_pedidos_pieza_id'];
            $cantidad[(int)$value['_pedidos_pieza_id']] = $value['_pedidos_cantidad'];
        }

        $piezas = get_posts( array(
                    "posts_per_page"   => -1,
                    "post__in" => $ids,
                    "post_type" => "piezas",
                    "orderby" => "post__in"
                ));

        foreach ($piezas as $key => $value) {

            $temp_in = get_post_meta( (int) $value->ID );
            $img_url = wp_get_attachment_url( (int)  $temp_in['_thumbnail_id'][0]);

            $cantidadWs = ((int) $cantidad[(int)$value->ID] > 0) ? (int) $cantidad[(int)$value->ID]: 0;

            $response[] = array(
                    "id" => (int) $value->ID,
                    "name" => $value->post_title,
                    "img_url" => $img_url,
                    "cantidad" => (int) $cantidadWs
                );

            $isOnYet = true;
            foreach ($this->piezas as $claves => $piezita) {
                if((int) $piezita['id'] == (int) $value->ID){
                    $suma = (int) $piezita['cantidad'] + (int) $cantidadWs;
                    $piezita['cantidad'] = $suma;
                    $this->piezas[$claves]['cantidad'] = $suma;
                    $isOnYet = false;
                }
            }
            if($isOnYet){
                $this->piezas[] = array(
                    "id" => (int) $value->ID,
                    "name" => $value->post_title,
                    "img_url" => $img_url,
                    "cantidad" => (int) $cantidadWs
                );
            }
            //...
        }

        return $response;

        //...
    }

    private function mdebug($strg, $sub = ""){

        $f = fopen("/Users/mimotic/Desktop/debug$sub.txt", "w");
        fwrite($f, print_r($strg, true));
        fclose($f);

    }

    private function get_informe_pedidos () {

        $response = array();

         // args pedidos
        $pedidos_settings = array(
            'post_type' => 'pedidos',
            'posts_per_page'   => -1,
            'post_status'   => array(
                                'draft',
                                'procesando',
                                'sin_stock',
                                'en_envio',
                                'completado'
                                ),
            'author'   => $this->user_ID
        );

        // args posts
        $pedidos_posts = get_posts( $pedidos_settings);

        foreach ($pedidos_posts as $key => $pedido) {

            $piezasIds = get_post_meta($pedido->ID, '_pedidos_piezas', false);
            $piezasIds = $piezasIds[0];


            $profe_nombre = get_user_meta($pedido->post_author, 'first_name', true);
            $profe_apellidos = get_user_meta($pedido->post_author, 'last_name', true);
            $zona_profe_id = get_user_meta($pedido->post_author, '_user_zona_asignada', true);
            $zona_pedido = get_term( $zona_profe_id, 'tax_zonas');

            $response[] = array(
                    'id' => $pedido->ID,
                    "piezasids" => $piezasIds,
                    "profesor" => $profe_nombre . ' ' . $profe_apellidos,
                    'zona' => array(
                                'id' => (int) $zona_pedido ->term_id,
                                'nombre' => $zona_pedido ->name,
                                'parent' => (int) $zona_pedido ->parent,
                            ),
                    "fecha" => $pedido->post_date,
                    "estado" => $pedido->post_status,
                    "piezas" => $this->get_piezas($piezasIds)
                );
        }

        return $response;
    }

    private function clases_to_teachers_reorder ($data) {

        $profesores_list = array();
        $profesores_en_la_clase = array();

        foreach ($data as $clase) {

            $datos_clase = $clase['clase'];

            $profesores_en_la_clase = $clase['profesores'];
            $sustitutos_en_la_clase = $clase['sustitutos'];

            foreach ($profesores_en_la_clase as $profesor_en_la_clase) {

                if( (int) $profesor_en_la_clase['id'] < 1) continue;

                if( !isset($profesores_list[$profesor_en_la_clase['id']]) ){
                    $profesores_list[$profesor_en_la_clase['id']] = array(
                            'meta_profe' => $profesor_en_la_clase
                        );
                }
                $profesores_list[$profesor_en_la_clase['id']]['clases'][$datos_clase['id']] = $datos_clase;

            }

            foreach ($sustitutos_en_la_clase as $sustituto_en_la_clase) {

                if( (int) $sustituto_en_la_clase['id'] < 1) continue;

                if( !isset($profesores_list[$sustituto_en_la_clase['id']]) ){
                    $profesores_list[$sustituto_en_la_clase['id']] = array(
                            'meta_profe' => $sustituto_en_la_clase
                        );
                }
                $profesores_list[$sustituto_en_la_clase['id']]['sustituciones'][$sustituto_en_la_clase['fecha']][$datos_clase['id']] = $datos_clase;
                $profesores_list[$sustituto_en_la_clase['id']]['sustituciones'][$sustituto_en_la_clase['fecha']][$datos_clase['id']]['fecha'] = $sustitutos_en_la_clase;
                $profesores_list[$sustituto_en_la_clase['id']]['sustituciones'][$sustituto_en_la_clase['fecha']][$datos_clase['id']]['sustituto'] = 1;

            }

            $profes_output = array();

            foreach ($profesores_list as $profesor) {
                $clases_profe = array();
                $sustituciones_profe = array();

                foreach ($profesor['clases'] as $clase) {
                    $clases_profe[] = $clase;
                }

                foreach ($profesor['sustituciones'] as $key => $sustituciones) {
                    foreach ($sustituciones as $sustituciones_clase) {
                        $sustituciones_clase['fecha'] = $key;
                        $clases_profe[] = $sustituciones_clase;
                    }
                }

                $profesor['clases'] = $clases_profe;
                unset($profesor['sustituciones']);
                $profes_output[] = $profesor;

            }

            // ...
        }

        usort($profes_output, function($a, $b) {
            return strcmp(strtolower($a['meta_profe']['nombre']), strtolower($b['meta_profe']['nombre']));
        });

        return $profes_output;
    }

    private function get_informe_passwords () {

        $response = array();

        $clases_posts = get_posts( array(
                        "post_type" => "clases",
                        'post_status' => 'clase_activo',
                        'posts_per_page' => -1
                    )
                );

        foreach ($clases_posts as $key => $clase) {

            $clase_meta_bruta = get_post_meta( $clase->ID );
            $colegio_id = (int) $clase_meta_bruta['clase_colegio'][0];
            $clase_pass = $clase_meta_bruta['_secret_key_colegio'][0];
            $clase_nombre = get_the_title($clase->ID);


            $colegio_meta_bruta = get_post_meta( $colegio_id );

            $colegio_nombre = get_the_title($colegio_id);
            $colegio_zona = wp_get_post_terms( $colegio_id, 'tax_zonas', array("fields" => "all") );

            $colegio_calendarios = $colegio_meta_bruta['clase_calendarios'];
            $calendarios_fechas = array();

            $response[] = array(
                    'id' => $clase->ID,
                    'name' => $clase_nombre,
                    'colegio' => $colegio_nombre,
                    'colegio_id' => $colegio_id,
                    'pass' => $clase_pass,
                    'colegio_zona' => array(
                        'id' => (int) $colegio_zona[0]->term_id,
                        'nombre' => $colegio_zona[0]->name,
                        'parent' => (int) $colegio_zona[0]->parent,
                    )
                );

        }

        return $response;

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


            $colegio_meta_bruta = get_post_meta( $colegio_id );

            $colegio_nombre = get_the_title($colegio_id);
            $colegio_zona = wp_get_post_terms( $colegio_id, 'tax_zonas', array("fields" => "all") );

            $colegio_calendarios = $colegio_meta_bruta['clase_calendarios'];
            $calendarios_fechas = array();

            if ( is_array($colegio_calendarios) ){
                foreach ($colegio_calendarios as $key => $calendario) {

                    $calendario_id = explode("opt_", $calendario);
                    $calendario_id = (int) $calendario_id[1];

                    if($calendario_id > 0){
                        $title_calendario = get_the_title($calendario_id);
                        $calendarios_fechas[] = get_post_meta($calendario_id, 'fecha_calendario', false);
                    }

                }
            }


            $colegio_dias_sin_clase = $colegio_meta_bruta['_clase_dias_sin_clase_colegio'];

            $clase_dias_recurrentes = maybe_unserialize($clase_meta_bruta['clase_semana'][0]);
            $clase_dias_recurrentes_output = array();

            foreach ($clase_dias_recurrentes as $key => $recurrentes) {
                $clase_dias_recurrentes_output[] = array(
                    'dia' => $recurrentes['clase_semana_dias'][0],
                    'inicio' => $recurrentes['clase_semana_ini'][0],
                    'fin' => $recurrentes['clase_semana_end'][0]
                );
            }

            $clase_extra_lectivos = maybe_unserialize($clase_meta_bruta['_clase_dias_extra_lectivos'][0]);
            $clase_extra_lectivos_output = array();

            foreach ($clase_extra_lectivos as $key => $extra) {
                $clase_extra_lectivos_output[] = array(
                    'dia' => $extra['fecha'],
                    'inicio' => $extra['clase_semana_ini'],
                    'fin' => $extra['clase_semana_end']
                );
            }


            $profesores = maybe_unserialize($clase_meta_bruta['_profesor_principal']);
            $profesores_output = array();

            foreach ($profesores as $key => $profe) {
                $zona_profe_id = get_user_meta($profe, '_user_zona_asignada', true);
                $zona_profe = get_term( $zona_profe_id, 'tax_zonas');
                $zona_profe_nombre = get_user_meta($profe, 'first_name', true);
                $zona_profe_apellidos = get_user_meta($profe, 'last_name', true);
                $zona_profe_bajas = get_user_meta($profe, '_profesor_no_asistencia', false);



                $profesores_output[] = array(
                    'id' => (int) $profe,
                    'nombre' => $zona_profe_nombre . ' ' . $zona_profe_apellidos,
                    'bajas' => $zona_profe_bajas ,
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
                $zona_sustituto_id = get_user_meta($sustituto['profesor'], '_user_zona_asignada', true);
                $zona_profe = get_term( $zona_sustituto_id, 'tax_zonas');
                $zona_profe_nombre = get_user_meta($sustituto['profesor'], 'first_name', true);
                $zona_profe_apellidos = get_user_meta($sustituto['profesor'], 'last_name', true);
                $zona_profe_bajas = get_user_meta($sustituto['profesor'], '_profesor_no_asistencia', false);
                $profesores_sustitutos_output[] = array(
                    'id' => (int) $sustituto['profesor'],
                    'nombre' => $zona_profe_nombre . ' ' . $zona_profe_apellidos,
                    'bajas' => $zona_profe_bajas ,
                    'fecha' => $sustituto['fecha'],
                    'zona' => array(
                                'id' => (int) $zona_profe->term_id,
                                'nombre' => $zona_profe->name,
                                'parent' => (int) $zona_profe->parent,
                            ),
                );
            }

            $temp = array(
                        'clase' => array(
                                'id' => $clase->ID,
                                'name' => $clase->post_title,
                                'colegio_id' => $colegio_id,
                                'colegio_name' => $colegio_nombre,
                                'colegio_calendarios' => $calendarios_fechas,
                                'colegio_dias_sin_clase' => $colegio_dias_sin_clase,
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





           array_push($response,$temp);
        }

        return $this->clases_to_teachers_reorder($response);
    }

  //...
}

new RobotsInformesDataGenerator();
