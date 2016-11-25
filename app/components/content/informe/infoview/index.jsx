'use strict'

import React from 'react'
import NoInformeSelected from './sinseleccion'
import SinDatos from './sindatos'

import InformeProfesores from './profesores'

class InformeView extends React.Component {

  constructor (props) {
    super(props)
  }

  componentWillMount () {
    this.handlerInformes()
  }

  getZonaSelected () {
    return this.props.workData.zonas.filter(zona => zona.selected)[0]
  }

  getInformeSelected () {
    return this.props.workData.informesMenu.filter(zona => zona.selected)[0]
  }

  handlerInformes () {
    let informe = this.getInformeSelected().name
    let zona = this.getZonaSelected().name
    switch (informe) {
      case 'Informe': return <NoInformeSelected />
      case 'Profesores': return <InformeProfesores zona={zona} {...this.props} />
      default: return <SinDatos informe={informe} />
    }
  }

  render () {
    return <main className='viewInformes'>{this.handlerInformes()}</main>
  }
}

InformeView.propTypes = {
  claseWrap: React.PropTypes.string,
  datosMenu: React.PropTypes.array,
  onChangeCallback: React.PropTypes.func
}

export default InformeView
