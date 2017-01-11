'use strict'

import React from 'react'

class InformePass extends React.Component {

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

  listPasswords () {
    let piezas = this.props.workData.passwords
    let passOutput = []

    piezas.sort((a, b) => b.colegio_id - a.colegio_id).map(password => {
      if (password.colegio_zona.id && password.colegio_zona.id > 0 && this.isValidZona(password.colegio_zona.id)) {
        passOutput.push(<div style={{background: 'white', margin: '.5em auto', padding: '.5em 1em', display: 'block', width: '100%', boxShadow: '0 1px 2px #999', height: 'auto', position: 'relative', overflow: 'hidden'}} key={password.id}>
          <p style={{marginLeft: '2em', float: 'left', width: '450px'}}> {password.name} </p>
          <p style={{marginLeft: '2em', float: 'left'}}> {password.pass} </p>
          <span style={{display: 'inline-block', background: '#0073aa', padding: '0.5em 1em', borderRadius: '3px', fontSize: '0.6em', color: 'white', fontWeight: '300', float: 'right', marginRight: '3em', marginTop: '1em'}}><strong>{password.colegio_zona.nombre}</strong></span>
        </div>)
      }
    })

    return passOutput
  }

  render () {
    let dataPiezas = this.listPasswords()
    return <div>
      <p className='introduction'>
        {dataPiezas.length} {dataPiezas.length === 1 ? 'password' : 'passwords'} de las clases activas por todos los tiempos <strong>(no le afecta el filtro de fechas)</strong>
      </p>
      <div>
        <div className='listaPiezas'>{dataPiezas}</div>
      </div>
    </div>
  }
}

export default InformePass
