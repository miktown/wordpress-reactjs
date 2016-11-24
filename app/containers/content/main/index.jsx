'use strict'

import React from 'react'
import Informe from '../informe'

class InformesWrapper extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      informesList: false
    }
  }

  componentWillMount () {
    // tal
  }

  render () {
    return <Informe informesList={this.state.informesList} {...this.props} />
  }

  // ...
}

export default InformesWrapper
