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

    private $clasesCache = false;

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

    private function is_admin () {
        if ( is_array($this->userRoles) && (in_array( 'administrator', $this->userRoles ) || in_array( 'fakeadmin', $this->userRoles ) ) ) return true;
        else if ( is_string($this->userRoles) && ('administrator' === $this->userRoles || 'fakeadmin' === $this->userRoles) ) return true;
        return false;
    }

    public function robots_informes_ajax_request () {

        $this->set_user_data();

        if ( isset($_REQUEST) ) {
            $this->informes_for_current_user();
            echo json_encode($this->response);
        }

        wp_die();
    }

    private function informes_for_current_user () {

        //zonas
        if($this->userZonas) $this->response['zonas'] = $this->userZonas;
        // menú
        if ( $this->is_admin() ) {
            $this->informesList = array(
                array('name' => 'Totales','selected' => false),
                array('name' => 'Informe','selected' => true),
                array('name' => 'Presencia','selected' => false),
                array('name' => 'Piezas','selected' => false),
                array('name' => 'Pedidos','selected' => false),
                array('name' => 'Passwords','selected' => false),
                array('name' => 'Colegios','selected' => false),
                array('name' => 'Alumnos','selected' => false),
                array('name' => 'Asistencia','selected' => false),
                array('name' => 'Profesores','selected' => false),
                array('name' => 'Sin Asignaturas','selected' => false),
                array('name' => 'Sin Fotos','selected' => false),
            );
        }
        $this->response['informesMenu'] = $this->informesList;
        $this->response['horas'] = $this->get_informe_profesores();
        $this->response['pedidos'] = $this->get_informe_pedidos();
        $this->response['piezas'] = $this->get_informe_piezas();
        $this->response['passwords'] = $this->get_informe_passwords();
        $this->get_informe_colegios();
        $this->response['alumnos'] = $this->get_informe_alumnos();
        $this->response['sinfotos'] = $this->get_informe_sinfotos();
    }

    private function get_clase_profesores_principales ($id_clase){
        $profesores_ids = get_post_meta( $id_clase, '_profesor_principal', false );
        $profes = array();
        foreach ($profesores_ids as $profe_id) {
            $temp_profe_metadata = get_userdata( $profe_id );
            $profes[] = array(
                'id' => $profe_id,
                'name' =>$temp_profe_metadata->display_name
            );
        }
        return $profes;
    }

    /**
     * consige las urls con los ids de las imágenes
     * @param  [array] $images_ids [array de ids]
     * @return mixed [array|false]
     */
    private function get_meta_date($images_ids){
        $response = array();
        if(count($images_ids) < 1) return $response;
        foreach ($images_ids as $key => $idImg) {
            $idImg = (int) $idImg;
            if($idImg < 1 ) continue;
            $dateImg = get_post_meta($idImg,'_media_clase_fecha', true);

            if ($dateImg) {
                $dateImg = explode("-", $dateImg);
                $dateImg = $dateImg ? $dateImg[2] . '/' . $dateImg[1] . '/' . $dateImg[0]: '' ;
                if(!in_array($dateImg, $response)) {
                    $response[] = $dateImg;
                }else{
                    continue;
                }
            } else {
                continue;
            }
        }
        return $response;
    }

    /**
     * Ordenar calendario dias lectivos serializados + custom days
     * @param  [array] $festivos
     * @return [array|false]
     */
    private function get_calendar_festivos_mergeado( $festivos_clase ,  $festivos_calendarios, $festivos_colegio){

        $festivos_clase  = (array) $festivos_clase;
        $response = array();

        foreach ($festivos_calendarios as $key => $value) {
            $splited = explode("_", $value);
            $splited = (int) end($splited);

            $temp = get_post_meta( $splited, 'fecha_calendario' );

            $response = array_merge($response,$temp);
        }

        if (!empty($festivos_colegio)) {
            $festivos_colegio = mimotic_array_clean_empty($festivos_colegio);
            $response = array_merge($response, $festivos_colegio);
        }

        if (count($festivos_clase) > 0) $response = array_merge($response, $festivos_clase);

        $response = mimotic_array_uniq($response);

        return $response;
        //...
    }

    private function set_clase_calendar ($clase) {

        $clase_meta_bruta = get_post_meta( $clase->ID );
        $colegio_id = (int) $clase_meta_bruta['clase_colegio'][0];
        $colegio_meta_bruta = get_post_meta( $colegio_id );

        $festivos_colegio = get_post_meta($colegio_id,'_clase_dias_sin_clase_colegio',false);
        $festivos_calendario = maybe_unserialize($colegio_meta_bruta['clase_calendarios']);
        $festivos_clase = $clase_meta_bruta['_clase_dias_sin_clase'];
        $images_teacher = (isset($clase_meta_bruta['_imagenes_profesor'])) ? $clase_meta_bruta['_imagenes_profesor']: array();

        return [
            "recurrentes" => maybe_unserialize($clase_meta_bruta['clase_semana'][0]),
            "extra_lectivos" => maybe_unserialize($clase_meta_bruta['_clase_dias_extra_lectivos'][0]),
            "id_clase" => $clase->ID,
            "nombre_clase" => $clase->post_title,
            "profes" => $this->get_clase_profesores_principales($clase->ID),
            "inicio_clase" => $clase_meta_bruta['_clase_inicio'][0],
            "fin_clase" => $clase_meta_bruta['_clase_fin'][0],
            "festivos" => $this->get_calendar_festivos_mergeado($festivos_colegio, $festivos_calendario, $festivos_clase),
            "colegio_id" => $colegio_id,
            "colegio_nombre" => get_the_title($colegio_id),
            "colegio_zona" => wp_get_post_terms( $colegio_id, 'tax_zonas', array("fields" => "all") ),
            "media" => $this->get_meta_date($images_teacher)
        ];
    }

    private function get_informe_sinfotos () {

        $response = Array();
        $clases =  $this->getClases();

        foreach ($clases as $clase){
            $response[] = $this->set_clase_calendar($clase);
        }

        usort($response, function($a, $b) {
            return $a['colegio_nombre'] <=> $b['colegio_nombre'];
        });

        return $response;
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

    private function getClases () {
        if($this->clasesCache == false) {
            $this->clasesCache =  get_posts( array(
                    'post_type' => 'clases',
                    'post_status' => 'clase_activo',
                    'posts_per_page' => -1
                )
            );
        }
        return $this->clasesCache;
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

        foreach ($alumnos_asignatura as $alumno)
            if((int)$alumno === (int)$alumno_id) return true;

        return false;
    }


    private function cleanClases($clases, $alumno_id){

        $response = array();
        $siteUrl = get_site_url();

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

            $curso_edad_nivel_term_id = (isset($curso_edad_nivel[0]) && $curso_edad_nivel[0]->term_id) ? $curso_edad_nivel[0]->term_id : '';
            $curso_edad_nivel_name = (isset($curso_edad_nivel[0]) && $curso_edad_nivel[0]->name) ? $curso_edad_nivel[0]->name : '';


            $clases_alumno_bruto = get_post_meta($alumno->ID,'_clase_in',false);

            $clases_alumno_bruto = $this->array_unique_multidimensional($clases_alumno_bruto);

            $clases_alumno = $this->cleanClases($clases_alumno_bruto,$alumno->ID);

            $response[] = array(
                "id" => $alumno->ID,
                "url" => $url,
                "nombre" => $alumno->post_title,
                "bajas" => $no_asistencia,
                "clases" => $clases_alumno,
                "profesores" => '',
                "curso" => array(
                    "id" => (int) $curso_edad_nivel_term_id,
                    "nombre" => $curso_edad_nivel_name
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
        $cantidad = array();

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

                if(isset($profesor['clases'])){
                    foreach ($profesor['clases'] as $clase) {
                        $clases_profe[] = $clase;
                    }
                }


                if(isset($profesor['sustituciones']) && is_array($profesor['sustituciones'])){
                    foreach ($profesor['sustituciones'] as $key => $sustituciones) {
                        foreach ($sustituciones as $sustituciones_clase) {
                            $sustituciones_clase['fecha'] = $key;
                            $clases_profe[] = $sustituciones_clase;
                        }
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
        $siteUrl = get_site_url();

        $clases_posts = $this->getClases();


        foreach ($clases_posts as $key => $clase) {

            $clase_meta_bruta = get_post_meta( $clase->ID );
            $colegio_id = (int) $clase_meta_bruta['clase_colegio'][0];
            $clase_pass = $clase_meta_bruta['_secret_key_colegio'][0];
            $clase_nombre = get_the_title($clase->ID);


            $colegio_meta_bruta = get_post_meta( $colegio_id );

            $colegio_nombre = get_the_title($colegio_id);
            $colegio_zona = wp_get_post_terms( $colegio_id, 'tax_zonas', array("fields" => "all") );

            // tiene asignaturas ?
            $ria_asignaturas = get_post_meta($clase->ID,'clase_asignaturas',false);

            if(is_array($ria_asignaturas) && count($ria_asignaturas) == 1 && $ria_asignaturas[0] == 0){
                $is_asignaturas = false;
            }else if(is_array($ria_asignaturas) && count($ria_asignaturas) > 0){
                $is_asignaturas = true;
            }else{
                $is_asignaturas = false;
            }

            $profe = get_post_meta($clase->ID, "_profesor_principal", true);
            $nombre = get_user_meta($profe, 'first_name', true);
            $apellidos = get_user_meta($profe, 'last_name', true);
            $nombre_completo = $nombre . ' ' . $apellidos;

            $url = $siteUrl . '/wp-admin/post.php?post=' . $clase->ID . '&action=edit';

            $response[] = array(
                'id' => $clase->ID,
                'profe' => $nombre_completo,
                'name' => $clase_nombre,
                'colegio' => $colegio_nombre,
                'colegio_id' => $colegio_id,
                'pass' => $clase_pass,
                'url' => $url,
                'meta' => $colegio_meta_bruta,
                'isasignaturas' => $is_asignaturas,
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
                    'clase_precio' => 0,
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
