'use strict'

import React from 'react'

class InformeAlumnos extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      colegioFilter: 0
    }
  }

  isValidZona (zonaTargetId) {
    let zonaSelected = this.props.workData.zonas.filter(zona => zona.selected)[0]

    if (zonaTargetId === zonaSelected.id) return true

    return this.isZonaChild(zonaSelected, zonaTargetId)
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

  setAlumnoCurso (curso) {
    return !curso ? 'sin nivel asignado' : curso
  }

  setFilterColegios () {
    let colegios = this.props.workData.alumnos.colegios
    let output = []
    colegios.map(colegio => {
      output.push(<option key={colegio.id} value={colegio.id}>{colegio.nombre} ({colegio.zona.nombre})</option>)
    })

    return output
  }

  decodeHtml (html) {
    let txt = document.createElement('textarea')
    txt.innerHTML = html
    return txt.value
  }

  getClasesIn (clases, alumnoId) {
    let output = []
    clases.map(clase => {
      output.push(<li style={{boxShadow: 'none', margin: 0, padding: '0.2em 0 0 4em'}} key={alumnoId + '_' + clase.clase + '_' + clase.asignatura}>- <a style={{color: '#666'}} href={clase.url} target='_blank'>{this.decodeHtml(clase.name)}</a></li>)
    })

    return output
  }

  listAlumnos () {
    let alumnos = this.props.workData.alumnos.alumnos
    let alumnosOutput = []

    alumnos
    .filter(alumno => this.isValidZona(alumno.zona.id))
    .filter(alumno => {
      if (this.state.colegioFilter === 0) return true
      return parseInt(alumno.colegio.id) === this.state.colegioFilter
    })
    .map(alumno => {
      alumnosOutput.push(<li style={{padding: '0.5em 0.5em 0.1em'}} key={alumno.id}>

        <p style={{marginBottom: '1.5em'}} className='studentIcon leftGo'>
          <span style={{color: '#333', fontWeight: '800'}}><a target='_blank' href={alumno.url}>{alumno.nombre}</a> ({alumno.colegio.nombre})</span>
          <strong className={alumno.tipo}>{this.setAlumnoCurso(alumno.curso.nombre)}</strong>
          <span style={{float: 'right', marginRight: '1em'}}>de <span style={{color: '#333', fontWeight: '800'}}>{alumno.profesor}</span> {alumno.zona.nombre}</span>
        </p>
        <ul key={alumno.id} style={{marginTop: '-1em', marginBottom: '1em'}}>{this.getClasesIn(alumno.clases, alumno.id)}</ul>
      </li>)
    })

    return alumnosOutput
  }

  filterColegiosChange (e) {
    this.setState({colegioFilter: parseInt(e.target.value)})
  }

  render () {
    let dataAlumnos = this.listAlumnos()
    return <div>
      <p className='introduction'>
        {dataAlumnos.length} {dataAlumnos.length === 1 ? 'alumno' : 'alumnos'} en <strong>{this.props.zona}</strong>
      </p>
      <div className='filtersWrap'>
        <div className='filters'>

          <select onChange={this.filterColegiosChange.bind(this)}>
            <option value='0' key={0}>Filtrar Colegio</option>
            {this.setFilterColegios()}
          </select>

        </div>
      </div>
      <div>
        <ul className='listaProfesores'>{dataAlumnos}</ul>
      </div>
    </div>
  }
}

export default InformeAlumnos
