'use strict'

import React from 'react'
import NoInformeSelected from './sinseleccion'
import SinDatos from './sindatos'

import InformeProfesores from './profesores'
import InformePedidos from './pedidos'
import InformePiezas from './piezas'
import InformePasswords from './passwords'

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
    switch (informe) {
      case 'Informe': return <NoInformeSelected />
      case 'Profesores': return <InformeProfesores zona={zona} {...this.props} />
      case 'Pedidos': return <InformePedidos zona={zona} {...this.props} />
      case 'Piezas': return <InformePiezas zona={zona} {...this.props} />
      case 'Passwords': return <InformePasswords zona={zona} {...this.props} />
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
