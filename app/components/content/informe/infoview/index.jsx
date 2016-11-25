'use strict'

import React from 'react'
import NoInformeSelected from './sinseleccion'
import SinDatos from './sindatos'

class InformeView extends React.Component {

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
    switch (informe) {
      case 'Informe': return <NoInformeSelected />
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
