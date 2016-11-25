'use strict'

import React from 'react'
import {render} from 'react-dom'
import AppWrapper from './components/wrapper'

class App extends React.Component {

  constructor (props) {
    super(props)
    this.url = window.location.protocol + "//" + window.location.host
  }

  render () {
    return <AppWrapper url={this.url} />
  }
}

render(<App />, document.getElementById('informesappria'))
