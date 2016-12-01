'use strict'

import React from 'react'
import moment from 'moment'
import 'moment/locale/es'

class InformePedidos extends React.Component {

  componentWillMount () {
    console.log('dataInit', this.props.workData.pedidos)
  }

  showPiezas (piezas) {
    console.log(piezas)
    let piezasOutput = []

    piezas.map(pieza => {
      piezasOutput.push(<div key={pieza.id}>
        <img style={{width: '50px', height: 'auto'}} src={pieza.img_url} />
        <p> {pieza.cantidad} x {pieza.name} </p>
      </div>)
    })

    return piezasOutput
  }

  listPedidos () {
    let pedidos = this.props.workData.pedidos
    let pedidosOutput = []

    pedidos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).map(pedido => {
      pedidosOutput.push(<li key={pedido.id}>
        <p className='pedidoIcon'>
          {moment(pedido.fecha).format('DD/MM/Y')} <strong className={pedido.estado}>{pedido.estado}</strong>
          <span style={{float: 'right', marginRight: '1em'}}>por {pedido.profesor} de {pedido.zona.nombre}</span>
        </p>

        <div className='calendarData'>{this.showPiezas(pedido.piezas)}</div>
      </li>)
    })

    return pedidosOutput
  }

  render () {
    let dataPedidos = this.listPedidos()
    return <div>
      <p className='introduction'>
        {dataPedidos.length} pedidos de <strong>{this.props.zona}</strong> desde el <strong>{moment(this.props.inicio, 'DD/MM/Y').format('DD/MM/Y')}</strong> hasta el <strong>{moment(this.props.fin, 'DD/MM/Y').format('DD/MM/Y')}</strong>
      </p>
      <div className=''>
        <ul className='listaProfesores'>{dataPedidos}</ul>
      </div>
    </div>
  }
}

export default InformePedidos
