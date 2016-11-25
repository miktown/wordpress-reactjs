'use strict'

import React from 'react'

class InformeView extends React.Component {

  constructor (props) {
    super(props)

    this.state = {
      informeName: this.props.false
    }
  }

  componentWillMount () {

  }

  render () {
    return <main className='viewInformes'>
        aquí mostramos el informe, neng
    </main>
  }
}

InformeView.propTypes = {
  claseWrap: React.PropTypes.string,
  datosMenu: React.PropTypes.array,
  onChangeCallback: React.PropTypes.func
}

export default InformeView
