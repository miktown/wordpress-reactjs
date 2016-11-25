'use strict'

import React from 'react'

if (!global.Intl) { // polyfill for `Intl`
  global.Intl = require('intl')
}

const IntlRelativeFormat = require('intl-relativeformat')
// require('intl-relativeformat/dist/locale-data/es.js')
// español
IntlRelativeFormat.__addLocaleData({'locale': 'es', 'pluralRuleFunction': function (n, ord) { if (ord) return 'other'; return n === 1 ? 'one' : 'other' }, 'fields': {'year': {'displayName': 'año', 'relative': {'0': 'este año', '1': 'el próximo año', '-1': 'el año pasado'}, 'relativeTime': {'future': {'one': 'dentro de {0} año', 'other': 'dentro de {0} años'}, 'past': {'one': 'hace {0} año', 'other': 'hace {0} años'}}}, 'month': {'displayName': 'mes', 'relative': {'0': 'este mes', '1': 'el próximo mes', '-1': 'el mes pasado'}, 'relativeTime': {'future': {'one': 'dentro de {0} mes', 'other': 'dentro de {0} meses'}, 'past': {'one': 'hace {0} mes', 'other': 'hace {0} meses'}}}, 'day': {'displayName': 'día', 'relative': {'0': 'hoy', '1': 'mañana', '2': 'pasado mañana', '-2': 'anteayer', '-1': 'ayer'}, 'relativeTime': {'future': {'one': 'dentro de {0} día', 'other': 'dentro de {0} días'}, 'past': {'one': 'hace {0} día', 'other': 'hace {0} días'}}}, 'hour': {'displayName': 'hora', 'relativeTime': {'future': {'one': 'dentro de {0} hora', 'other': 'dentro de {0} horas'}, 'past': {'one': 'hace {0} hora', 'other': 'hace {0} horas'}}}, 'minute': {'displayName': 'minuto', 'relativeTime': {'future': {'one': 'dentro de {0} minuto', 'other': 'dentro de {0} minutos'}, 'past': {'one': 'hace {0} minuto', 'other': 'hace {0} minutos'}}}, 'second': {'displayName': 'segundo', 'relative': {'0': 'ahora'}, 'relativeTime': {'future': {'one': 'dentro de {0} segundo', 'other': 'dentro de {0} segundos'}, 'past': {'one': 'hace {0} segundo', 'other': 'hace {0} segundos'}}}}})
var rf = new IntlRelativeFormat('es')

class UpdatedInfo extends React.Component {

  doActualizar (e) {
    e.preventDefault()
    this.props.onClick()
  }

  humanDate (dateValue) {
    return rf.format(dateValue)
  }

  render () {
    return this.props.updated
      ? (<footer className={'updatedInfo'}>
        <p>Datos de <strong>{this.humanDate(this.props.updated)}</strong><a onClick={this.doActualizar.bind(this)} href='!#1'>¿actualizar?</a></p>
      </footer>) : (<footer>sin datos</footer>)
  }
}

UpdatedInfo.propTypes = {
  updated: React.PropTypes.number,
  onClick: React.PropTypes.func.isRequired
}

export default UpdatedInfo
