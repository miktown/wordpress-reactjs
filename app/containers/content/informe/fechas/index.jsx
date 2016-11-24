'use strict'

import React from 'react'
import DatePicker from 'react-datepicker'

class Fechas extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      focusDateStart: false,
      focusDateEnd: false
    }
  }

  handleChangeStart (date) {
    this.props.onChangeDate(date, this.props.dateEnd)
  }
  handleChangeEnd (date) {
    this.props.onChangeDate(this.props.dateStart, date)
  }

  handleToggleBlur (cual) {
    this.setState({
      [cual]: this.state[cual] ? !this.state[cual] : this.state[cual]
    })
  }
  handleToggleFocus (cual) {
    this.setState({
      [cual]: this.state[cual] ? this.state[cual] : !this.state[cual]
    })
  }

  isFocusCssClass (cual) {
    return this.state[cual] ? ' open' : ''
  }

  render () {
    return <section className='fechaInformes'>

        Desde:
      <div className='wrapInputFechas'>
        <DatePicker
          selected={this.props.dateStart}
          onChange={this.handleChangeStart.bind(this)}
          onBlur={() => this.handleToggleBlur('focusDateStart')}
          onFocus={() => this.handleToggleFocus('focusDateStart')}
          dateFormat='DD/MM/YYYY'
          locale='es-es'
          maxDate={this.props.dateEnd}
          popoverAttachment='top left'
          popoverTargetAttachment='top left'
          popoverTargetOffset='29px -95px' />
        <div className={'underLineInformes' + this.isFocusCssClass('focusDateStart')} />
      </div>

          Hasta:
      <div className='wrapInputFechas'>
        <DatePicker
          selected={this.props.dateEnd}
          onChange={this.handleChangeEnd.bind(this)}
          onBlur={() => this.handleToggleBlur('focusDateEnd')}
          onFocus={() => this.handleToggleFocus('focusDateEnd')}
          dateFormat='DD/MM/YYYY'
          locale='es-es'
          minDate={this.props.dateStart}
          popoverAttachment='top left'
          popoverTargetAttachment='top left'
          popoverTargetOffset='29px -95px' />
        <div className={'underLineInformes' + this.isFocusCssClass('focusDateEnd')} />
      </div>

    </section>
  }
}

Fechas.propTypes = {
  onChangeDate: React.PropTypes.func
}

export default Fechas
