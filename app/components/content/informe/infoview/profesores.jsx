'use strict'

import React from 'react'
import Moment from 'moment'
var esES = require('moment/locale/es.js')
Moment.locale('es', esES)

class InformeProfesores extends React.Component {

  componentWillMount () {
    console.log('dataInit', this.props.workData.profesores)
  }

  getDayNumber (dayStr) {
    console.log('dayStr-prev', dayStr)
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

    console.log('dayStr-prev-number', day)

    return day
  }

  // getFirstDayFromDate (dateStart, dayStr) {
  //   let dateIni = Moment(dateStart, 'DD/MM/Y').day(dayStr.toLowerCase).format('DD/MM/Y')
  //   let dateIniA = Moment(dateIni, 'DD/MM/Y').format('DD/MM/Y')
  //   let dateClassB = Moment(dateStart, 'DD/MM/Y').format('DD/MM/Y')

  //   if ( Moment(dateIniA, 'DD/MM/Y').isBefore(dateClassB, 'DD/MM/Y') ){
  //     dateIni = Moment(dateStart, 'DD/MM/Y').day(this.getDayNumber(dayStr) + 7).format('DD/MM/Y')
  //   }

  //   return dateIni
  // }

  getFirstDayFromDate(dateStart,dayStr,formatIn,formatOut){
    if(!formatIn) formatIn = 'DD/MM/Y'
    if(!formatOut) formatOut = 'DD/MM/Y'
    var dayInt = this.getDayNumber(dayStr)

    var dateIni = Moment(dateStart,formatIn).day(dayInt).format(formatOut)

    var dateIniA = Moment(dateIni,formatIn).format('DD/MM/Y')
    var dateClassB = Moment(dateStart,formatIn).format('DD/MM/Y')

    if(Moment(dateIniA).isBefore(dateClassB)){
      dateIni = Moment(dateStart,formatIn).day(dayInt + 7).format(formatOut)
    }

    return dateIni
  }

  isDateSameOrBefore (classDay, fin) {
    return Moment(classDay, 'DD/MM/Y').isSameOrBefore(Moment(fin, 'DD/MM/Y'))
  }

  getClassDays (ini, fin, lectivo) {
    let daysClases = []
    let classDay = this.getFirstDayFromDate(ini, lectivo.dia)

    daysClases.push(classDay)

    while (this.isDateSameOrBefore(classDay, fin)) {
      classDay = Moment(classDay, 'DD/MM/Y').add(7, 'days').format('DD/MM/Y')
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
            if (claseRecurrenteTal.dia.toLowerCase() === Moment(clase.fecha, 'DD/MM/Y').format('dddd').toLowerCase()) {
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
    let profesores = this.props.workData.profesores
    let profesoresOutput = []

    profesores.map(profesor => {
      if (profesor.meta_profe.zona.id && profesor.meta_profe.zona.id > 0 && this.isValidZona(profesor.meta_profe.zona.id)) {
        let calendar = []
        let calendarYearsMonths = []
        console.log('calendar-prev-profesor-clases', profesor.clases)
        console.log('calendar-prev-profesor-bajas', profesor.meta_profe.bajas)
        console.log('calendar-prev-profesor-bruta', profesor)
        calendar = self.createCalendar(profesor.clases, profesor.meta_profe.bajas).filter(dia => { return Moment(dia.dia, 'DD/MM/Y').isBetween(self.props.inicio, self.props.fin, null, '[]') })
        console.log('calendar', calendar)
        calendar.map(date => {
          console.log('date', date)
          let year = Moment(date.dia, 'DD/MM/Y').year()
          let month = Moment(date.dia, 'DD/MM/Y').month() // return 0 to 11 -> 0 == January and 11 == December
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
            fechas.push(date.dia)
            calendarYearsMonths[year][month] = {
              horas: horasAcumulado,
              precioAcumulado: precioAcumulado,
              media: laMedia,
              clases: clases,
              fechas: fechas
            }
          } else {
            let horasNuevo = duracionHoras
            let precioNuevo = duracionHoras * parseFloat(date.precio)
            let laMediaNuevo = precioNuevo / horasNuevo
            let fechas = [date.dia]
            calendarYearsMonths[year][month] = {
              horas: horasNuevo,
              precioAcumulado: precioNuevo,
              media: laMediaNuevo,
              clases: 1,
              fechas: fechas
            }
          }
        })

        profesoresOutput.push(<li key={profesor.meta_profe.id}>
          {profesor.meta_profe.nombre} (de <strong>{profesor.meta_profe.zona.nombre}</strong>)
          <div className='calendarData'>{self.createCalendarView(calendarYearsMonths)}</div>
        </li>)
      }
    })

    return profesoresOutput
  }

  createDaysView (days) {
    let output = []
    days.map((day, key) => output.push(<p key={key}>{day}</p>))
    return output
  }

  createCalendarView (calendar) {
    console.log('createCalendarView', calendar)
    let self = this
    let output = []
    calendar.map((year, keyYear) => year.map((month, keyMonth) => {
      console.log('createCalendarView-month', month)
      output.push(<div key={keyYear.toString() + keyMonth.toString()}>Mes: {self.getMonthName(keyMonth)}/{keyYear} - horas: {month.horas.toFixed(2)} - Precio Total: {month.precioAcumulado.toFixed(2)}€ - Media: {month.media.toFixed(2)}€/hora - Número de Clases: {month.clases} <div>{this.createDaysView(month.fechas)}</div></div>)
    }))
    return output
  }

  getMonthName (month) {
    return [ 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre' ][month]
  }

  render () {
    return <div>
      Datos de profesores de <strong>{this.props.zona}</strong> desde el <strong>{Moment(this.props.inicio).format('DD/MM/Y')}</strong> hasta el <strong>{Moment(this.props.fin).format('DD/MM/Y')}</strong>
      <div className=''>
        <ul className='listaProfesores'>{this.listProfesores()}</ul>
      </div>
    </div>
  }
}

export default InformeProfesores
