'use strict'

import React from 'react'
import Informe from '../content/informe'

class AppWrapper extends React.Component {

  constructor (props) {
    super(props)

    this.state = {
      updated: 0,
      workData: false,
      updatedMsg: 'Comprobando si existen datos...'
    }
  }

  componentWillMount () {
    this.dataStateEval()
  }

  dataUpdateSetter (data) {
    this.setDataStored('infomes_updated', new Date().getTime())
    this.setDataStored('infomes_data_work', data)

    this.dataStateEval()
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
    if (this.state.updated !== 0) this.setState({ updated: 0 })
    this.getDataFromWp()
  }

  selectorMenu (workData) {
    this.setState({
      workData: workData
    })
  }

  actualizarVista (updated, workData) {
    this.setState({
      updated: updated,
      workData: workData
    })
  }

  dataStateEval () {
    let informesUpdated = this.getDataStored('infomes_updated')
    let informesWorkData = this.getDataStored('infomes_data_work')
    return informesUpdated && informesWorkData ? this.actualizarVista(informesUpdated, informesWorkData) : this.doActualizar()
  }

  getDataFromWp () {
    let self = this

    this.setState({
      updatedMsg: 'Sincronizando con base datos...'
    })

    window.jQuery.ajax({
      url: self.props.url + '/wp-admin/admin-ajax.php',
      data: {
        'action': 'robots_informes_ajax_request',
        'idcolegio': 'ok'
      },
      success: function (data) {
        let dataJSON = JSON.parse(data)
        self.dataUpdateSetter(dataJSON)
      },
      error: function (errorThrown) {
        console.log(errorThrown)
      }
    })
  }

  render () {
    return <Informe
      updatedMsg={this.state.updatedMsg}
      updated={this.state.updated}
      workData={this.state.workData}
      selectorMenu={this.selectorMenu.bind(this)}
      onClick={this.doActualizar.bind(this)} />
  }

  // ...
}

export default AppWrapper
