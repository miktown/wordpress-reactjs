'use strict'

import React from 'react'
import InformesWrapper from '../content/main'

class AppWrapper extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      updated: 0
    }
  }

  componentWillMount () {
    this.dataStateEval()
  }

  dataUpdateSetter (data) {
    this.setDataStored('infomes_updated', new Date().getTime())
    return this.getDataStored('infomes_updated') || 0
  }

  getDataStored (key) {
    return JSON.parse(window.localStorage.getItem(key)) || false
  }

  setDataStored (key, data) {
    window.localStorage.setItem(key, JSON.stringify(data))
  }

  removeDataStored (key) {
    window.localStorage.removeItem(key)
    return this.getDataStored(key) === 0
  }

  doActualizar () {
    this.actualizarVista(this.getDataFromWp())
  }

  actualizarVista (informesUpdated) {
    this.setState({
      updated: informesUpdated
    })
  }

  dataStateEval () {
    let informesUpdated = this.getDataStored('infomes_updated')
    return informesUpdated ? this.actualizarVista(informesUpdated) : this.doActualizar()
  }

  getDataFromWp () {
    return this.dataUpdateSetter()
  }

  render () {
    return <InformesWrapper
      updated={this.state.updated}
      onClick={this.doActualizar.bind(this)} />
  }

  // ...
}

export default AppWrapper
