'use strict'

import React from 'react'
import moment from 'moment'
import 'moment/locale/es'

class InformeHoras extends React.Component {

  static getDayNumber (dayStr) {
    var day = 1
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

  translateDay (dayEnglish) {
    var day = 1
    switch (dayEnglish.toLowerCase()) {
      case 'sunday':
        day = 'domingo'
        break
      case 'monday':
        day = 'lunes'
        break
      case 'tuesday':
        day = 'martes'
        break
      case 'wednesday':
        day = 'miércoles'
        break
      case 'thursday':
        day = 'jueves'
        break
      case 'friday':
        day = 'viernes'
        break
      case 'saturday':
        day = 'sabado'
        break
      default:
        day = 'lunes'
        break
    }

    return day
  }

  getFirstDayFromDate (dateStart, dayStr, formatIn = 'DD/MM/Y', formatOut = 'DD/MM/Y') {
    var dayInt = InformeHoras.getDayNumber(dayStr)

    var dateIni = moment(dateStart, formatIn).day(dayInt).format(formatOut)

    var dateIniA = moment(dateIni, formatIn).format('DD/MM/Y')
    var dateClassB = moment(dateStart, formatIn).format('DD/MM/Y')

    if (moment(dateIniA, formatIn).isBefore(dateClassB)) {
      dateIni = moment(dateStart, formatIn).day(dayInt + 7).format(formatOut)
    }

    return dateIni
  }

  isDateSameOrBefore (classDay, fin) {
    return moment(classDay, 'DD/MM/Y').isSameOrBefore(moment(fin, 'DD/MM/Y'), 'DD/MM/Y')
  }

  getClassDays (ini, fin, lectivo) {
    let daysClases = []
    let classDay = this.getFirstDayFromDate(ini, lectivo.dia)

    daysClases.push(classDay)

    while (this.isDateSameOrBefore(classDay, fin)) {
      classDay = moment(classDay, 'DD/MM/Y').add(7, 'days').format('DD/MM/Y')
      if (this.isDateSameOrBefore(classDay, fin) !== false) daysClases.push(classDay)
    }

    return daysClases
  }

  calculateDias (finCurso, iniCurso, precioHora, diasRecurrentes) {
    let self = this
    let output = []
    diasRecurrentes.map(dataDia => {
      let fechasList = self.getClassDays(iniCurso, finCurso, dataDia)
      fechasList.map(fecha => {
        output.push({
          dia: fecha,
          inicio: dataDia.inicio,
          fin: dataDia.fin,
          precio: precioHora
        })
      })
    })

    return output
  }

  createCalendar (clases, bajasProfesor) {
    let self = this
    let output = {}
    output.bajas = []
    output.lectivos = []
    bajasProfesor.map(baja => output.bajas.push(baja))

    clases.map((clase) => {
      if (!clase.hasOwnProperty('fecha')) {
        // días sin clase
        if (clase.colegio_dias_sin_clase) clase.colegio_dias_sin_clase.map(diaSinClase => { if (diaSinClase) output.bajas.push(diaSinClase) })
        // lupos me pide quitar los días del calendario // para control de presencia vuelvo a activarlos
        if (clase.colegio_calendarios) clase.colegio_calendarios.map(calendario => calendario.map(diaSinClase => { if (diaSinClase) output.bajas.push(diaSinClase) }))
        if (clase.clase_sin_clase) clase.clase_sin_clase.map(diaSinClase => { if (diaSinClase) output.bajas.push(diaSinClase) })

        // días con clase
        if (clase.clases_extra_lectivos) {
          clase.clases_extra_lectivos.map(diaConClase => {
            if (diaConClase.dia && diaConClase.inicio && diaConClase.fin) {
              diaConClase.precio = clase.clase_precio
              output.lectivos.push(diaConClase)
            }
          })
        }
        self.calculateDias(clase.clase_fin, clase.clase_ini, clase.clase_precio, clase.clase_recurrentes).map(dia => output.lectivos.push(dia))
      } else {
        let inClaseExtra = false
        clase.clases_extra_lectivos.map(claseExtra => {
          if (claseExtra.dia === clase.fecha) {
            claseExtra.precio = clase.clase_precio
            output.lectivos.push(claseExtra)
            inClaseExtra = true
          }
        })

        if (!inClaseExtra) {
          clase.clase_recurrentes.map(claseRecurrenteTal => {
            if (self.translateDay(claseRecurrenteTal.dia) === moment(clase.fecha, 'DD/MM/Y').format('dddd').toLowerCase()) {
              output.lectivos.push({
                dia: clase.fecha,
                inicio: claseRecurrenteTal.inicio,
                fin: claseRecurrenteTal.fin,
                precio: clase.clase_precio
              })
            }
          })
        }
      }

      output.lectivos = output.lectivos.filter(dia => output.bajas.indexOf(dia.dia) < 0)
    })

    return output.lectivos
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

  listProfesores () {
    let self = this
    let profesores = this.props.workData.horas
    let profesoresOutput = []

    profesores
      .map(profesor => {
        if (profesor.meta_profe.zona.id && profesor.meta_profe.zona.id > 0 && this.isValidZona(profesor.meta_profe.zona.id)) {
          let calendar = []
          let calendarYearsMonths = []
          calendar = self.createCalendar(profesor.clases, profesor.meta_profe.bajas).filter(dia => { return moment(dia.dia, 'DD/MM/Y').isBetween(self.props.inicio, self.props.fin, 'days', '[]') })
          calendar.map(date => {
            let year = moment(date.dia, 'DD/MM/Y').year()
            let month = moment(date.dia, 'DD/MM/Y').month() // return 0 to 11 -> 0 == January and 11 == December
            if (!calendarYearsMonths[year]) {
              calendarYearsMonths[year] = []
            }
            let duracionHoras = parseFloat(date.fin) / 60

            if (calendarYearsMonths[year][month]) {
              let horasAcumulado = calendarYearsMonths[year][month].horas + duracionHoras
              let precioAcumulado = (duracionHoras * parseFloat(date.precio)) + calendarYearsMonths[year][month].precioAcumulado
              let laMedia = precioAcumulado / horasAcumulado
              let clases = calendarYearsMonths[year][month].clases + 1
              let fechas = calendarYearsMonths[year][month].fechas
              let desglose = calendarYearsMonths[year][month].desglose
              fechas.push(date.dia)
              desglose.push(self.setDesgloseString(date))
              calendarYearsMonths[year][month] = {
                horas: horasAcumulado,
                precioAcumulado,
                media: laMedia,
                desglose,
                clases,
                fechas
              }
            } else {
              let horasNuevo = duracionHoras
              let precioNuevo = duracionHoras * parseFloat(date.precio)
              let laMediaNuevo = precioNuevo / horasNuevo
              let fechas = [date.dia]
              let desglose = [self.setDesgloseString(date)]
              calendarYearsMonths[year][month] = {
                horas: horasNuevo,
                precioAcumulado: precioNuevo,
                media: laMediaNuevo,
                desglose,
                clases: 1,
                fechas
              }
            }
          })

          profesoresOutput.push(<li key={profesor.meta_profe.id}>
            <span className='profesorIcon'> {profesor.meta_profe.nombre} <strong>{profesor.meta_profe.zona.nombre}</strong></span>
            <div className='calendarData'>{self.createCalendarView(calendarYearsMonths)}</div>
          </li>)
        }
      })

    return profesoresOutput
  }

  setDesgloseString (date) {
    let endDate = moment(date.inicio, 'HH:mm').add(date.fin, 'minutes').format('HH:mm')
    return `El día ${date.dia} entró a las ${date.inicio} y salió a las ${endDate}`
  }

  convertFloatHours (floatHours) {
    let justHours = parseInt(floatHours)
    let justMinutes = parseInt(floatHours * 60 - justHours * 60)
    return justHours + 'h y ' + justMinutes + 'min'
  }

  createListDesgloseView (desglose) {
    let output = []
    desglose.sort().map((desglosado, index) => {
      output.push(<div style={{paddingLeft: '2em', color: '#8e3d74'}} key={index}><br /><span className='dashicons dashicons-backup' /> <strong>{desglosado}</strong></div>)
    })
    return output
  }

  createCalendarView (calendar) {
    let self = this
    let output = []
    calendar.map((year, keyYear) => year.map((month, keyMonth) => {
      output.push(<div style={{paddingLeft: '4em'}} key={keyYear.toString() + keyMonth.toString()}><br />· En <strong> {self.getMonthName(keyMonth)} de {keyYear}</strong> impartió {month.clases} clases ({this.convertFloatHours(month.horas.toFixed(2))}) {self.createListDesgloseView(month.desglose)}</div>)
    }))
    return output
  }

  getMonthName (month) {
    return [ 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre' ][month]
  }

  render () {
    let dataProfesores = this.listProfesores()

    return <div>
      <p className='introduction'>
        Mostrando {dataProfesores.length} {dataProfesores.length === 1 ? 'profesor' : 'profesores'} de <strong>{this.props.zona}</strong> desde el <strong>{moment(this.props.inicio, 'DD/MM/Y').format('DD/MM/Y')}</strong> hasta el <strong>{moment(this.props.fin, 'DD/MM/Y').format('DD/MM/Y')}</strong>
      </p>
      <div className=''>
        <ul className='listaProfesores'>{dataProfesores}</ul>
      </div>
    </div>
  }
}

export default InformeHoras
