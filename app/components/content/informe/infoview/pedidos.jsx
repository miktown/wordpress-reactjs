'use strict'

import React from 'react'
import moment from 'moment'
import 'moment/locale/es'

class InformePedidos extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      filters: {
        draft: true,
        procesando: false,
        sin_stock: false,
        en_envio: false,
        completado: false
      }
    }
  }

  isValidZona (zonaTargetId) {
    let zonaSelected = this.props.workData.zonas.filter(zona => zona.selected)[0]

    if (zonaTargetId === zonaSelected.id) return true

    return this.isZonaChild(zonaSelected, zonaTargetId)
  }

  isZonaChild (zonaSelected, zonaTargetId) {
    let self = this

    let zonaID = zonaSelected.id

    let result = false

    let sonZonasSelected = this.props.workData.zonas.filter(zona => zona.parentId === zonaID)
    if (sonZonasSelected) {
      sonZonasSelected.map(zonaHija => {
        if (!result) {
          if (zonaHija.id === zonaTargetId) result = true
          else result = self.isZonaChild(zonaHija, zonaTargetId)
        }
      })
    }

    return result
  }

  showPiezas (piezas) {
    let piezasOutput = []

    piezas.map(pieza => {
      piezasOutput.push(<div style={{clear: 'both', float: 'none', margin: '.2em .9em', padding: '.5em', display: 'inline-block', width: '46%', boxShadow: '0 1px 2px #999', height: 'auto', overflow: 'hidden'}} key={pieza.id}>
        <img style={{width: '50px', height: 'auto', float: 'left'}} src={pieza.img_url} />
        <p style={{marginLeft: '2em', float: 'left'}}> <strong>{pieza.cantidad} {pieza.cantidad === 1 ? 'unidad' : 'unidades'}</strong> </p>
        <p style={{marginLeft: '2em', float: 'left'}}> {pieza.cantidad} x {pieza.name} </p>
      </div>)
    })

    return piezasOutput
  }

  listPedidos () {
    let pedidos = this.props.workData.pedidos
    let pedidosOutput = []

    pedidos.filter(pedido => this.state.filters[pedido.estado]).filter(pedido => this.isValidZona(pedido.zona.id)).sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).map(pedido => {
      pedidosOutput.push(<li key={pedido.id}>
        <p style={{marginBottom: '1.5em'}} className='pedidoIcon'>
          <span style={{color: '#333', fontWeight: '800'}}><a target='_blank' href={this.props.url + '/wp-admin/post.php?post=' + pedido.id + '&action=edit'}>{moment(pedido.fecha).format('DD/MM/Y')}</a></span> <strong className={pedido.estado}>{pedido.estado === 'draft' ? 'nuevo' : pedido.estado}</strong>
          <span style={{float: 'right', marginRight: '1em'}}>por <span style={{color: '#333', fontWeight: '800'}}>{pedido.profesor}</span> ({pedido.zona.nombre})</span>
        </p>

        <div className='calendarData'>{this.showPiezas(pedido.piezas)}</div>
      </li>)
    })

    return pedidosOutput
  }

  onClickBtnFilter (el) {
    let filterState = this.state.filters
    filterState[el] = !filterState[el]
    this.setState({
      filters: filterState
    })
  }

  render () {
    let dataPedidos = this.listPedidos()
    return <div>
      <p className='introduction'>
        {dataPedidos.length} {dataPedidos.length === 1 ? 'pedido' : 'pedidos'} de <strong>{this.props.zona}</strong> por todos los tiempos <strong>(no le afecta el filtro de fechas)</strong>
      </p>
      <div className='filters'>
      Filtros por Estado:
        <span onClick={this.onClickBtnFilter.bind(this,'draft')} className={this.state.filters.draft ? 'selected' : null}>Nuevo</span>
        <span onClick={this.onClickBtnFilter.bind(this,'procesando')} className={this.state.filters.procesando ? 'selected' : null}>Procesando</span>
        <span onClick={this.onClickBtnFilter.bind(this,'sin_stock')} className={this.state.filters.sin_stock ? 'selected' : null}>Sin Stock</span>
        <span onClick={this.onClickBtnFilter.bind(this,'en_envio')} className={this.state.filters.en_envio ? 'selected' : null}>En Envio</span>
        <span onClick={this.onClickBtnFilter.bind(this,'completado')} className={this.state.filters.completado ? 'selected' : null}>Completado</span>
      </div>
      <div className=''>
        <ul className='listaProfesores'>{dataPedidos}</ul>
      </div>
    </div>
  }
}

export default InformePedidos
