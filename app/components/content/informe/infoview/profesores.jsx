'use strict'

import React from 'react'
import Moment from 'moment'

class InformeProfesores extends React.Component {

  componentWillMount () {
    console.log(this.props.workData.profesores)
  }

  render () {
    return <div className='viewInformes'>Datos de profesores de <strong>{this.props.zona}</strong> desde el <strong>{Moment(this.props.inicio).format('DD/MM/Y')}</strong> hasta el <strong>{Moment(this.props.fin).format('DD/MM/Y')}</strong></div>
  }
}

export default InformeProfesores
