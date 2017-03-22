'use strict'

import React from 'react'
import {CSVLink} from 'react-csv'

class InformePiezas extends React.Component {

  constructor (props) {
    super(props)

    this.csv = {
      data: []
    }
  }

  listPiezas () {
    let piezas = this.props.workData.piezas
    let piezasOutput = []

    piezas.sort((a, b) => b.cantidad - a.cantidad).map(pieza => {
      piezasOutput.push(<div style={{background: 'white', margin: '.5em auto', padding: '.5em 1em', display: 'block', width: '400px', boxShadow: '0 1px 2px #999', height: 'auto', position: 'relative', overflow: 'hidden'}} key={pieza.id}>
        <img style={{width: '50px', height: 'auto', float: 'left'}} src={pieza.img_url} />
        <p style={{marginLeft: '2em', float: 'left'}}> <strong>{pieza.cantidad} {pieza.cantidad === 1 ? 'unidad' : 'unidades'}</strong> </p>
        <p style={{marginLeft: '2em', float: 'left'}}> {pieza.name} </p>
      </div>)
      this.csv.data.push(
          { pieza: pieza.name, cantidad: pieza.cantidad }
      )
    })

    return piezasOutput
  }

  render () {
    let dataPiezas = this.listPiezas()
    return <div>
      <p className='introduction'>
        {dataPiezas.length} {dataPiezas.length === 1 ? 'pieza' : 'piezas'} de todos los pedidos existentes por todos los tiempos <strong>(no le afecta el filtro de fechas ni el de zona)</strong>
        <CSVLink filename={`${this.props.informe}_${this.props.zona}.csv`} data={this.csv.data} separator={';'} style={{float: 'right', marginRight: '1em', marginLeft: '-1em'}}>descargar CSV</CSVLink>
      </p>
      <div>
        <div className='listaPiezas'>{dataPiezas}</div>
      </div>
    </div>
  }
}

export default InformePiezas
