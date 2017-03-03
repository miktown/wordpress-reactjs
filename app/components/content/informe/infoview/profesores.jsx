'use strict'

import React from 'react'
import {CSVLink} from 'react-csv'

class InformeProfesores extends React.Component {

  constructor (props) {
    super(props)

    this.csv = {
      headers: ['Profesor', 'Clase'],
      data: []
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

  createClases (clases, profeId, profeNombre) {
    // let self = this
    let clasesOutput = []

    if (clases.length < 1) return (<span />)

    clasesOutput.push(<div style={{marginTop: '1em'}} />)

    clases.map(clase => {
      this.csv.data.push(
        { PROFESOR: profeNombre, CLASE: clase.name }
      )

      let url = `${this.props.url}/wp-admin/post.php?post=${clase.id}&action=edit`
      clasesOutput.push(<div style={{marginLeft: '3.5em', color: '#a7a7a7', marginTop: '.5em'}} key={clase.id + '_' + profeId}>- <a href={url} target='_blank'>{clase.name}</a></div>)
    })
    return clasesOutput
  }

  listProfesores () {
    let self = this
    let profesores = this.props.workData.horas
    let profesoresOutput = []

    profesores
      .map(profesor => {
        if (profesor.meta_profe.zona.id && profesor.meta_profe.zona.id > 0 && this.isValidZona(profesor.meta_profe.zona.id)) {
          profesoresOutput.push(<li key={profesor.meta_profe.id}>
            <span className='profesorIcon'> {profesor.meta_profe.nombre} ({profesor.clases.length}) <strong>{profesor.meta_profe.zona.nombre}</strong></span>
            <div className='calendarData'>{self.createClases(profesor.clases, profesor.meta_profe.id, profesor.meta_profe.nombre)}</div>
          </li>)
        }
      })

    return profesoresOutput
  }


  componentWillReceiveProps (nextProps) {
    if (nextProps !== this.props) {
      this.csv.data = []
    }
  }

  render () {
    let dataProfesores = this.listProfesores()

    return <div>

      <p className='introduction'>
        Mostrando {dataProfesores.length} {dataProfesores.length === 1 ? 'profesor' : 'profesores'} de <strong>{this.props.zona}</strong>
        <CSVLink filename={`${this.props.informe}_${this.props.zona}.csv`} data={this.csv.data} separator={";"} style={{float: 'right', marginRight: '1em', marginLeft: '-1em'}}>descargar CSV</CSVLink>
      </p>
      <div className=''>
        <ul className='listaProfesores'>{dataProfesores}</ul>
      </div>
    </div>
  }
}

export default InformeProfesores
