'use strict'

import React from 'react'

class InformeColegios extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      filters: {
        col_publico: true,
        col_concertado: true,
        col_privado: true
      }
    }
  }

  isValidZona (zonaTargetId) {
    let zonaSelected = this.props.workData.zonas.filter(zona => zona.selected)[0]

    if (zonaTargetId === zonaSelected.id) return true

    return this.isZonaChild(zonaSelected, zonaTargetId)
  }

  stringTipoClean (tipo) {
    return tipo.replace('col_', '').replace('u', 'ú')
  }

  isZonaChild (zonaSelected, zonaTargetId) {
    let self = this

    let zonaID = zonaSelected.id

    let result = false

    let sonZonasSelected = this.props.workData.zonas.filter(zona => zona.parentId === zonaID)
    if (sonZonasSelected) {
      sonZonasSelected.map(zonaHija => {
        if (!result) {
          if (zonaHija.id === zonaTargetId) result = true
          else result = self.isZonaChild(zonaHija, zonaTargetId)
        }
      })
    }

    return result
  }

  listColegios () {
    let colegios = this.props.workData.colegios
    let colegiosOutput = []

    colegios
    .filter(colegio => this.state.filters[colegio.tipo])
    .filter(colegio => this.isValidZona(colegio.zona.id))
    .map(colegio => {
      colegiosOutput.push(<li style={{padding: '0.5em 0.5em 0.1em'}} key={colegio.id}>
        <p style={{marginBottom: '1.5em'}} className='colegioIcon leftGo'>
          <span style={{color: '#333', fontWeight: '800'}}><a target='_blank' href={colegio.url}>{colegio.nombre}</a></span> <strong className={colegio.tipo}>{this.stringTipoClean(colegio.tipo)}</strong>
          <span style={{float: 'right', marginRight: '1em'}}>de <span style={{color: '#333', fontWeight: '800'}}>{colegio.profesor}</span> {colegio.zona.nombre}</span>
        </p>
      </li>)
    })

    return colegiosOutput
  }

  onClickBtnFilter (el) {
    let filterState = this.state.filters
    filterState[el] = !filterState[el]
    this.setState({
      filters: filterState
    })
  }

  render () {
    let dataColegios = this.listColegios()
    return <div>
      <p className='introduction'>
        {dataColegios.length} {dataColegios.length === 1 ? 'colegio' : 'colegios'} en <strong>{this.props.zona}</strong>
      </p>
      <div className='filtersWrap'>
        <div className='filters'>
          <span onClick={this.onClickBtnFilter.bind(this, 'col_privado')} className={this.state.filters.col_privado ? 'selected' : null}>Privado</span>
          <span onClick={this.onClickBtnFilter.bind(this, 'col_concertado')} className={this.state.filters.col_concertado ? 'selected' : null}>Concertado</span>
          <span onClick={this.onClickBtnFilter.bind(this, 'col_publico')} className={this.state.filters.col_publico ? 'selected' : null}>Público</span>
        </div>
      </div>
      <div>
        <ul className='listaProfesores'>{dataColegios}</ul>
      </div>
    </div>
  }
}

export default InformeColegios
