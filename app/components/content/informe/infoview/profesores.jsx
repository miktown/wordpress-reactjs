'use strict'

import React from 'react'

class InformeProfesores extends React.Component {

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

  createClases (clases, profeId) {
    // let self = this
    let clasesOutput = []

    if (clases.length < 1) return (<span></span>)

    clasesOutput.push(<div style={{marginTop:'1em'}}></div>)

    clases.map(clase => {
      let url = `${this.props.url}/wp-admin/post.php?post=${clase.id}&action=edit`
      clasesOutput.push(<div style={{marginLeft:'3.5em',color:'#a7a7a7',marginTop:'.5em'}} key={clase.id + '_' + profeId}>- <a href={url} target="_blank">{clase.name}</a></div>)
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
            <div className='calendarData'>{self.createClases(profesor.clases, profesor.meta_profe.id)}</div>
          </li>)
        }
      })

    return profesoresOutput
  }

  render () {
    let dataProfesores = this.listProfesores()
    return <div>
      <p className='introduction'>
        Mostrando {dataProfesores.length} {dataProfesores.length === 1 ? 'profesor' : 'profesores'} de <strong>{this.props.zona}</strong>
      </p>
      <div className=''>
        <ul className='listaProfesores'>{dataProfesores}</ul>
      </div>
    </div>
  }
}

export default InformeProfesores
