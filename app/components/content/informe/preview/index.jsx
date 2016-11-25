'use strict'

import React from 'react'

class Preview extends React.Component {

  render () {
    return <div className='informesPreview'>

      <div className='informesLoader'>
        <div className='loader'>Loading...</div>
      </div>
      <p className='titleInformes'>Informes <span className='infoDoing blue'>{this.props.updatedMsg}</span></p>

    </div>
  }
}

export default Preview
