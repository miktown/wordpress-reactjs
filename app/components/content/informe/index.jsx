'use strict'

import React from 'react'
import moment from 'moment'
import 'moment/locale/es'

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
      dateStart: moment().subtract(1, 'month').date(1),
      dateEnd: moment().subtract(1, 'month').endOf('month')
    }
  }

  selectorHandle (seleccionado, target) {
    this.props.workData[target].map(item => {
      item.selected = item.name === seleccionado
    })
    this.props.selectorMenu(this.props.workData)
  }

  selectorInformeHandle (seleccionado) {
    this.selectorHandle(seleccionado, 'informesMenu')
  }

  selectorZonaHandle (seleccionado) {
    this.selectorHandle(seleccionado, 'zonas')
  }

  changeDateHandle (startDate, endDate) {
    this.setState({
      dateStart: startDate,
      dateEnd: endDate
    })
  }

  render () {
    return this.props.updated
      ? <div id='informes_wrapper'>
        <header className='headerInformes'>
          <Selector
            claseWrap='informeZonas'
            datosMenu={this.props.workData.zonas}
            onChangeCallback={this.selectorZonaHandle.bind(this)} />
          <Selector
            claseWrap='informeInformes'
            datosMenu={this.props.workData.informesMenu}
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
          workData={this.props.workData}
          filtros={false}
          {...this.props} />
        <UpdatedInfo {...this.props} />
      </div> : <Preview {...this.props} />
  }
}

Informe.propTypes = {
  updated: React.PropTypes.number,
  onClick: React.PropTypes.func.isRequired
}

export default Informe
