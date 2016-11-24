'use strict'

import React from 'react'
import moment from 'moment'

import Selector from './selector'
import Filtros from './filtros'
import Fechas from './fechas'
import InformeView from './infoview'
import UpdatedInfo from '../updated'
import Preview from './preview'

class Informe extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      dataWork: this.props.datos || false,
      dateStart: moment().subtract(1, 'month').date(1),
      dateEnd: moment().subtract(1, 'month').endOf('month')
    }
  }

  selectorHandle (seleccionado, target) {
    this.state.dataWork[target].map((item) => {
      item.selected = item.name === seleccionado
    })
    this.setState({
      dataWork: this.state.dataWork
    })
  }

  selectorInformeHandle (seleccionado) {
    this.selectorHandle(seleccionado, 'infromesMenu')
  }

  selectorZonaHandle (seleccionado) {
    this.selectorHandle(seleccionado, 'informesZonas')
  }

  changeDateHandle (startDate, endDate) {
    this.setState({
      dateStart: startDate,
      dateEnd: endDate
    })
  }

  render () {
    return this.props.informesList
      ? <div id='informes_wrapper'>
        <header className='headerInformes'>
          <Selector
            claseWrap='informeZonas'
            datosMenu={this.state.dataWork.informesZonas}
            onChangeCallback={this.selectorZonaHandle.bind(this)} />
          <Selector
            claseWrap='informeInformes'
            datosMenu={this.state.dataWork.infromesMenu}
            onChangeCallback={this.selectorInformeHandle.bind(this)} />
          <Filtros
            filtros={false}
            onClickCallback={this.selectorInformeHandle.bind(this)} />
          <Fechas
            dateStart={this.state.dateStart}
            dateEnd={this.state.dateEnd}
            onChangeDate={this.changeDateHandle.bind(this)} />
        </header>
        <InformeView
          inicio={this.state.dateStart}
          fin={this.state.dateEnd}
          informe={false}
          filtros={false}
          {...this.props} />
        <UpdatedInfo {...this.props} />
      </div> : <Preview />
  }
}

Informe.propTypes = {
  updated: React.PropTypes.number,
  onClick: React.PropTypes.func.isRequired
}

export default Informe
