'use strict'

import React from 'react'

class SinDatos extends React.Component {

  render () {
    return <div className='sinDatos'>{`No exiten datos para el informe de ${this.props.informe}`}</div>
  }
}

export default SinDatos
