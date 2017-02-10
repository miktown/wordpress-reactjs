'use strict'

import React from 'react'
import moment from 'moment'
import 'moment/locale/es'

class InformeTotales extends React.Component {

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

  filterColegiosChange (e) {
    this.setState({colegioFilter: parseInt(e.target.value)})
  }

  setFilterColegios () {
    let colegios = this.props.workData.alumnos.colegios
    let output = []
    colegios.map(colegio => {
      output.push(<option key={colegio.id} value={colegio.id}>{colegio.nombre} ({colegio.zona.nombre})</option>)
    })

    return output
  }

  isInThisSchool (school) {
    if (this.state.colegioFilter === 0) return true
    return parseInt(school) === this.state.colegioFilter
  }

  decodeHtml (html) {
    let txt = document.createElement('textarea')
    txt.innerHTML = html
    return txt.value
  }

  isDateBetween (day) {
    let start = moment(this.props.inicio, 'DD/MM/Y')
    let finish = moment(this.props.fin, 'DD/MM/Y')
    return moment(day, 'DD/MM/Y').isBetween(start, finish, 'days', '[]')
  }

  createViewEdad (totales) {
    let response = []

    // edad
    Object.keys(totales.edad).forEach(function (key) {
      if (key === 'total') response.push(<li style={{boxShadow: 'none', margin: '1em 0 0 0', padding: '1em 0 1em 4em'}} key={'total'}><strong> ∑ {totales.edad[key]}</strong></li>)
      else if (!totales.edad[key].name) response.push(<li style={{boxShadow: 'none', margin: 0, padding: '.5em 0 .5em 4em'}} key={'sinasignar'}><strong>Sin Asignar</strong> - ({totales.edad[key].total} en total)</li>)
      else response.push(<li style={{boxShadow: 'none', margin: 0, padding: '0.2em 0 0 4em'}} key={totales.edad[key].id}>en <strong>{totales.edad[key].name}</strong> hay {totales.edad[key].total} alumnos</li>)
    })

    return response
  }

  createViewColegio (totales) {
    let response = []

    // colegios
    Object.keys(totales.colegio).forEach(function (key) {
      if (key === 'total') response.push(<li style={{boxShadow: 'none', margin: '1em 0 0 0', padding: '1em 0 1em 4em'}} key={'total'}><strong> ∑ {totales.colegio[key]}</strong></li>)
      else if (!totales.colegio[key].name) response.push(<li style={{boxShadow: 'none', margin: 0, padding: '0.2em 0 0 4em'}} key={'sinasignar'}><strong>Sin Asignar</strong> - ({totales.colegio[key].total} en total)</li>)
      else response.push(<li style={{boxShadow: 'none', margin: 0, padding: '0.2em 0 0 4em'}} key={totales.colegio[key].id}><strong>{totales.colegio[key].name} ({totales.colegio[key].zona})</strong> -> {totales.colegio[key].total} alumnos</li>)
    })

    return response
  }

  createViewClases (totales) {
    let response = []

    // clases
    Object.keys(totales.clase).forEach(function (key) {
      if (key === 'total') response.push(<li style={{boxShadow: 'none', margin: 0, padding: '0.2em 0 0 4em'}} key={'total'}><strong> ∑ {totales.clase[key]}</strong></li>)
      else if (!totales.clase[key].name) response.push(<li style={{boxShadow: 'none', margin: 0, padding: '0.2em 0 0 4em'}} key={'sinasignar'}><strong>Sin Asignar</strong> - ({totales.clase[key].total} en total)</li>)
      else response.push(<li style={{boxShadow: 'none', margin: 0, padding: '0.2em 0 0 4em'}} key={totales.clase[key].id}>en <strong><a href={totales.clase[key].url} target="_blank">{totales.clase[key].name}</a> ({totales.clase[key].zona})</strong> - ({totales.clase[key].total} en total)</li>)
    })

    return response
  }

  createViewAsignatura (totales) {
    let response = []
    let self = this

    // asignatura
    Object.keys(totales.asignatura).forEach(function (key) {
      if (key === 'total') response.push(<li style={{boxShadow: 'none', margin: 0, padding: '0.2em 0 0 4em'}} key={'total'}><strong> ∑ {totales.asignatura[key]}</strong></li>)
      else if (!totales.asignatura[key].name) response.push(<li style={{boxShadow: 'none', margin: 0, padding: '0.2em 0 0 4em'}} key={'sinasignar'}><strong>Sin Asignar</strong> - ({totales.asignatura[key].total} en total)</li>)
      else response.push(<li style={{boxShadow: 'none', margin: 0, padding: '0.2em 0 0 4em'}} key={totales.asignatura[key].id}><strong>{self.decodeHtml(totales.asignatura[key].name)}</strong> - {totales.asignatura[key].total} alumnos</li>)
    })

    return response
  }

  getTotales () {
    let alumnos = this.props.workData.alumnos.alumnos
    let totales = {}

    totales.colegio = {}
    totales.colegio['total'] = 0

    totales.edad = {}
    totales.edad['total'] = 0

    totales.clase = {}

    totales.asignatura = {}

    alumnos.map(alumno => {
      if(this.isValidZona(alumno.zona.id) && this.isInThisSchool(alumno.colegio.id)){
          // colegio
          totales.colegio['total']++
          if (totales.colegio[alumno.colegio.id] === undefined) {
            totales.colegio[alumno.colegio.id] = {
              total: 1,
              name: alumno.colegio.nombre,
              id: alumno.colegio.id,
              zona: alumno.zona.nombre
            }
          } else totales.colegio[alumno.colegio.id].total++

          // edad
          totales.edad['total']++
          if (totales.edad[alumno.curso.id] === undefined) {
            totales.edad[alumno.curso.id] = {
              total: 1,
              name: alumno.curso.nombre,
              id: alumno.curso.id
            }
          } else totales.edad[alumno.curso.id].total++

          alumno.clases.map(clase => {
              // clase
            if (totales.clase[clase.clase] === undefined) {
              totales.clase[clase.clase] = {
                total: 1,
                name: clase.name,
                id: clase.clase,
                url: clase.url,
                zona: alumno.zona.nombre
              }
            } else totales.clase[clase.clase].total++

              // asignatura
            if (totales.asignatura[clase.asignatura] === undefined) {
              totales.asignatura[clase.asignatura] = {
                total: 1,
                name: clase.asignaturaname,
                id: clase.asignatura
              }
            } else totales.asignatura[clase.asignatura].total++
          })
      }
    })
    console.log('totales', totales)
    return totales
  }

  render () {
    let dataTotales = this.getTotales()
    let edad = this.createViewEdad(dataTotales)
    let colegio = this.createViewColegio(dataTotales)
    let clase = this.createViewClases(dataTotales)
    let asignatura = this.createViewAsignatura(dataTotales)
    return <div>
      <p className='introduction'>
        {dataTotales.length} {dataTotales.length === 1 ? 'alumno' : 'alumnos'} en <strong>{this.props.zona}</strong>
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
        <h2>Edad</h2>
        <ul className='listaProfesores'>{edad}</ul>
        <h2>Colegios</h2>
        <ul className='listaProfesores'>{colegio}</ul>
        <h2>Clases</h2>
        <ul className='listaProfesores'>{clase}</ul>
        <h2>Asignaturas</h2>
        <ul className='listaProfesores'>{asignatura}</ul>
      </div>
    </div>
  }
}

export default InformeTotales
