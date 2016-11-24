var express = require('express')

var app = express()

app.use(express.static('./public'))

app.get('/', function (req, res) {
  res.sendFile('./index.html', { title: 'informes app ' })
})

app.get('/wp/mock', function (req, res, next) {
  let datos = {
    infromesMenu: [
      {
        name: 'Profesores',
        selected: false
      },
      {
        name: 'Alumnos',
        selected: true
      },
      {
        name: 'Pedidos',
        selected: false
      },
      {
        name: 'Bajas',
        selected: false
      },
      {
        name: 'Altas',
        selected: false
      }
    ],
    informesZonas: [
      {
        name: 'Pozuelo',
        selected: false
      },
      {
        name: 'Majadahonda',
        selected: true
      },
      {
        name: 'Madrid',
        selected: false
      },
      {
        name: 'Toledo',
        selected: false
      }
    ]
  }

  setTimeout(function () {
    res.send(datos)
  }, 3000)
})

app.listen(3000, function (err) {
  if (err) return (console.log('Hubo un error'), process.exit(1))
  console.log('Informes app escuchando en el puerto 3000')
})
