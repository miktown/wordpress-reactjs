'use strict'

import React from 'react'

class Selector extends React.Component {

  doClick (val) {
    this.props.onChangeCallback(val)
  }

  createMenu () {
    let output = []
    let isFirst = true
    let isNextFirstClass = ''

    this.props.datosMenu.sort((a, b) => a.name.localeCompare(b.name)).filter(value => value.name === 'Informe' ? value.selected : true).map((value, i) => {
      let isSelected = value.selected === true ? ' selected' : ''
      if (isFirst === true && value.selected !== true) {
        isNextFirstClass = ' firstNext'
        isFirst = false
      } else {
        isNextFirstClass = ''
      }
      output.push(<div key={'informeMenu' + i} className={'selector_opcion' + isSelected + isNextFirstClass} onClick={() => this.doClick(value.name)}>{value.name}</div>)
    })

    return output
  }

  render () {
    return this.props.datosMenu
      ? <section className={this.props.claseWrap}><div ref='selector_informe' className='selector selector_informe'>{this.createMenu()}</div></section> : null
  }
}

Selector.propTypes = {
  claseWrap: React.PropTypes.string,
  datosMenu: React.PropTypes.array,
  onChangeCallback: React.PropTypes.func
}

export default Selector
