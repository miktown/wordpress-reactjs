'use strict'

import React from 'react'
import NoInformeSelected from './sinseleccion'
import SinDatos from './sindatos'

import InformeHoras from './horas'
import InformeProfesores from './profesores'
import InformePedidos from './pedidos'
import InformePiezas from './piezas'
import InformePasswords from './passwords'
import InformeColegios from './colegios'
import InformeAlumnos from './alumnos'
import InformeAsistencia from './asistencia'
import InformeTotales from './totales'
import InformeSinAsignaturas from './sinasignaturas'

class InformeView extends React.Component {

  componentWillMount () {
    this.whatInforme()
  }

  getZonaSelected () {
    return this.props.workData.zonas.filter(zona => zona.selected)[0]
  }

  getInformeSelected () {
    return this.props.workData.informesMenu.filter(zona => zona.selected)[0]
  }

  whatInforme () {
    let informe = this.getInformeSelected().name
    let zona = this.getZonaSelected().name
    console.log(informe);
    switch (informe) {
      case 'Informe': return <NoInformeSelected />
      case 'Nóminas': return <InformeHoras informe={informe} zona={zona} {...this.props} />
      case 'Profesores': return <InformeProfesores informe={informe} zona={zona} {...this.props} />
      case 'Pedidos': return <InformePedidos informe={informe} zona={zona} {...this.props} />
      case 'Piezas': return <InformePiezas informe={informe} zona={zona} {...this.props} />
      case 'Passwords': return <InformePasswords informe={informe} zona={zona} {...this.props} />
      case 'Colegios': return <InformeColegios informe={informe} zona={zona} {...this.props} />
      case 'Alumnos': return <InformeAlumnos informe={informe} zona={zona} {...this.props} />
      case 'Asistencia': return <InformeAsistencia informe={informe} zona={zona} {...this.props} />
      case 'Totales': return <InformeTotales informe={informe} zona={zona} {...this.props} />
      case 'Sin Asignaturas': return <InformeSinAsignaturas informe={informe} zona={zona} {...this.props} />
      default: return <SinDatos informe={informe} />
    }
  }

  render () {
    return <main className='viewInformes'>{this.whatInforme()}</main>
  }
}

InformeView.propTypes = {
  claseWrap: React.PropTypes.string,
  datosMenu: React.PropTypes.array,
  onChangeCallback: React.PropTypes.func
}

export default InformeView
