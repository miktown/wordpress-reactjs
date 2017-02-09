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

  isDateBetween (day) {
    let start = moment(this.props.inicio, 'DD/MM/Y')
    let finish = moment(this.props.fin, 'DD/MM/Y')
    return moment(day, 'DD/MM/Y').isBetween(start, finish, 'days', '[]')
  }

  getBajas (bajas) {
    let mesesBajas = {}
    let response = []

    bajas.map(baja => {
      if (baja !== '' && this.isDateBetween(baja)) {
        let mesYear = moment(baja, 'DD/MM/Y').format('MMMY')
        if (mesesBajas[mesYear] === undefined) {
          mesesBajas[mesYear] = {
            total: 1,
            name: mesYear
          }
        } else mesesBajas[mesYear].total++
      }
    })

    Object.keys(mesesBajas).forEach(function (key) {
      if (mesesBajas[key].total > 1) {
        response.push(<li style={{boxShadow: 'none', margin: 0, padding: '0.2em 0 0 4em'}} key={mesesBajas[key].name}>en <strong>{mesesBajas[key].name}</strong> - ({mesesBajas[key].total} veces)</li>)
      }
    })

    return response
  }

  setAlumnoCurso (curso) {
    return !curso ? 'sin nivel asignado' : curso
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
      let bajasAlumnos = this.getBajas(alumno.bajas)
      if (bajasAlumnos.length > 0) {
        alumnosOutput.push(<li style={{padding: '0.5em 0.5em 0.1em'}} key={alumno.id}>

          <p style={{marginBottom: '1.5em'}} className='studentIcon leftGo'>
            <span style={{color: '#333', fontWeight: '800'}}><a target='_blank' href={alumno.url}>{alumno.nombre}</a> ({alumno.colegio.nombre})</span>
            <strong className={alumno.tipo}>{this.setAlumnoCurso(alumno.curso.nombre)}</strong>
            <span style={{float: 'right', marginRight: '1em'}}>de <span style={{color: '#333', fontWeight: '800'}}>{alumno.profesor}</span> {alumno.zona.nombre}</span>
          </p>
          <ul style={{marginTop: '-1em', marginBottom: '1em'}}>{bajasAlumnos}</ul>

        </li>)
      }
    })

    return alumnosOutput
  }

  createViewEdad (totales) {
    let response = []

    // edad
    Object.keys(totales.edad).forEach(function (key) {
      if (key === 'total') response.push(<li style={{boxShadow: 'none', margin: 0, padding: '0.2em 0 0 4em'}} key={'total'}><strong> ∑ {totales.edad[key]}</strong></li>)
      else if (!totales.edad[key].name) response.push(<li style={{boxShadow: 'none', margin: 0, padding: '0.2em 0 0 4em'}} key={'sinasignar'}><strong>Sin Asignar</strong> - ({totales.edad[key].total} en total)</li>)
      else response.push(<li style={{boxShadow: 'none', margin: 0, padding: '0.2em 0 0 4em'}} key={totales.edad[key].id}>en <strong>{totales.edad[key].name}</strong> - ({totales.edad[key].total} en total)</li>)
    })

    return response
  }

  createViewColegio (totales) {
    let response = []

    // edad
    Object.keys(totales.colegio).forEach(function (key) {
      if (key === 'total') response.push(<li style={{boxShadow: 'none', margin: 0, padding: '0.2em 0 0 4em'}} key={'total'}><strong> ∑ {totales.colegio[key]}</strong></li>)
      else if (!totales.colegio[key].name) response.push(<li style={{boxShadow: 'none', margin: 0, padding: '0.2em 0 0 4em'}} key={'sinasignar'}><strong>Sin Asignar</strong> - ({totales.colegio[key].total} en total)</li>)
      else response.push(<li style={{boxShadow: 'none', margin: 0, padding: '0.2em 0 0 4em'}} key={totales.colegio[key].id}>en <strong>{totales.colegio[key].name} ({totales.colegio[key].zona})</strong> - ({totales.colegio[key].total} en total)</li>)
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
            url: clase.url
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
    })
    console.log('totales', totales)
    return totales
  }
// <select onChange={this.filterColegiosChange.bind(this)}>
          //   <option value='0' key={0}>Filtrar Colegio</option>
          //   {this.setFilterColegios()}
          // </select>
          //
  render () {
    let dataTotales = this.getTotales()
    let edad = this.createViewEdad(dataTotales)
    let colegio = this.createViewColegio(dataTotales)
    return <div>
      <p className='introduction'>
        {dataTotales.length} {dataTotales.length === 1 ? 'alumno' : 'alumnos'} en <strong>{this.props.zona}</strong>
      </p>
      <div className='filtersWrap'>
        <div className='filters' />
      </div>
      <div>
        <ul className='listaProfesores'>{edad}</ul>
        <ul className='listaProfesores'>{colegio}</ul>
      </div>
    </div>
  }
}

export default InformeTotales
