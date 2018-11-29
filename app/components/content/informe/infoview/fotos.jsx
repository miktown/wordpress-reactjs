'use strict'

import React from 'react'
import moment from 'moment'
import 'moment/locale/es'

class InformeSinFotos extends React.Component {

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

  isValidZona (zonaTargetId) {
    let zonaSelected = this.props.workData.zonas.filter(zona => zona.selected)[0]
    return (zonaTargetId === zonaSelected.id) ? true : this.isZonaChild(zonaSelected, zonaTargetId)
  }

  showProfes (profes) {
    let output = []
    profes.forEach(profe => {
      profe.id
      profe.name
      output.push(<li key={profe.id}><span className='profesorIcon'>{profe.name} ({profe.id})</span></li>)
    })
    return output
  }

  getDayNumber (dayStr) {
    let day = 1
    switch (dayStr.toLowerCase()) {
      case 'sunday':
        day = 0
        break
      case 'monday':
        day = 1
        break
      case 'tuesday':
        day = 2
        break
      case 'wednesday':
        day = 3
        break
      case 'thursday':
        day = 4
        break
      case 'friday':
        day = 5
        break
      case 'saturday':
        day = 6
        break
      default:
        day = 1
        break
    }
    return day
  }

  cleanFestivos (dates, festivos) {
    return dates.filter(date => festivos.indexOf(date) < 0)
  }

  isDateSameOrBefore (classDay, fin, classDayFormat, finFormat) {
    if (!classDayFormat) classDayFormat = 'DD/MM/YYYY'
    if (!finFormat) finFormat = 'DD/MM/YYYY'
    return moment(classDay, classDayFormat).isSameOrBefore(moment(fin, finFormat))
  }

  getFirstDayFromDate (dateStart, dayStr, formatIn, formatOut) {
    if (!formatIn) formatIn = 'DD/MM/YYYY'
    if (!formatOut) formatOut = 'DD/MM/YYYY'

    var dayInt = this.getDayNumber(dayStr)

    var dateIni = moment(dateStart, formatIn).day(dayInt).format(formatOut)

    var dateIniA = moment(dateIni, formatIn).format('YYYY-MM-DD')
    var dateClassB = moment(dateStart, formatIn).format('YYYY-MM-DD')

    if (moment(dateIniA).isBefore(dateClassB)) {
      dateIni = moment(dateStart, formatIn).day(dayInt + 7).format(formatOut)
    }

    return dateIni
  }

  getClassDays (ini, fin, lectivo) {
    let daysClases = []
    let classDay = this.getFirstDayFromDate(ini, lectivo.clase_semana_dias[0])

    daysClases.push(classDay)

    while (this.isDateSameOrBefore(classDay, fin)) {
      let classDayMoment = moment(classDay, 'DD/MM/YYYY')
      classDay = classDayMoment.add(7, 'days').format('DD/MM/YYYY')
      if (!classDayMoment.isBetween(moment(this.props.inicio, 'DD/MM/YYYY'), moment(this.props.fin, 'DD/MM/YYYY'))) continue
      if (this.isDateSameOrBefore(classDay, fin) === false) {
        continue
      } else {
        daysClases.push(classDay)
      }
    }

    return daysClases
  }

  daysWithoutPhoto (fechasClases, media) {
    return fechasClases.filter(fecha => !media.includes(fecha))
  }

  createListatumWithoutPhotos (dates) {
    let output = []
    if (dates && dates.length > 0) {
      dates.sort(function (a, b) {
        return moment(a, 'DD/MM/YYYY').format('X') - moment(b, 'DD/MM/YYYY').format('X')
      }).forEach((date, index) => {
        output.push(<div key={index} className='calendarData'>El día {date} no subieron fotos</div>)
      })
    }
    return output
  }

  getDiasSinFotos (clase) {
    let fechasClases = []
    clase.recurrentes.forEach(diaRecurrente => {
      const fechasDiasLectivos = this.getClassDays(clase.inicio_clase, clase.fin_clase, diaRecurrente)
      fechasClases = [...fechasClases, ...fechasDiasLectivos]
    })

    clase.extra_lectivos.forEach(day => {
      if (day.fecha !== '') fechasClases.push(day.fecha)
    })

    fechasClases = this.cleanFestivos(fechasClases, clase.festivos)
    let daysWithoutPhoto = this.daysWithoutPhoto(fechasClases, clase.media)

    return this.createListatumWithoutPhotos(daysWithoutPhoto)
  }

  listClases () {
    let output = []
    let clases = this.props.workData.sinfotos
    clases.forEach(clase => {
      if (clase.colegio_zona[0].term_taxonomy_id && clase.colegio_zona[0].term_taxonomy_id > 0 && this.isValidZona(clase.colegio_zona[0].term_taxonomy_id)) {
        const diasSinFoto = this.getDiasSinFotos(clase)
        if (diasSinFoto.length > 0) {
          let url = `${this.props.url}/wp-admin/post.php?post=${clase.id_clase}&action=edit`
          output.push(<li key={clase.id_clase}>
            <span className='profesorIcon colegioIcon'> <a href={url} target='_blank'>{clase.nombre_clase.replace('?', '->')}</a> <strong>{clase.colegio_zona[0].name}</strong></span>
            <ul className='calendarData'>{this.showProfes(clase.profes)}</ul>
            <div className='calendarData'>{this.getDiasSinFotos(clase)}</div>
          </li>)
        }
      }
    })

    return output
  }

  render () {
    let listClases = this.listClases()
    return <div>
      <p className='introduction'>
        Mostrando {listClases.length} {listClases.length === 1 ? 'clase' : 'clases'} sin fotos de <strong>{this.props.zona}</strong> desde el <strong>{moment(this.props.inicio, 'DD/MM/Y').format('DD/MM/Y')}</strong> hasta el <strong>{moment(this.props.fin, 'DD/MM/Y').format('DD/MM/Y')}</strong>
      </p>
      <div className=''>
        <ul className='listaProfesores'>{listClases}</ul>
      </div>
    </div>
  }
}

export default InformeSinFotos
