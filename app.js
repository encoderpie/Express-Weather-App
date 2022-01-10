const { response } = require('express')
const express = require('express')
const app = express()
const locale = require("locale")
const https = require('https')
const fs = require('fs');
require('dotenv/config')

app.set('view engine', 'ejs')
app.use(express.static( "public" ))

//var indexCss = {
//   style: fs.readFileSync('./views/styles/index_style.ejs','utf8')
//}
var weatherCss = {
   style: fs.readFileSync('./views/styles/weather_style.ejs','utf8')
}

app.get('/', function (req, res) {
   //res.render('index', {
   //   indexCss: indexCss
   //})
   const countrys = ['San Fransisco', 'Amsterdam', 'New York', 'Istanbul', 'Tokyo', 'Madrid', 'Rize', 'Paris']
   var countryNumber = Math.floor(Math.random() * 7)
   res.redirect('/weather?city=' + countrys[countryNumber])
})

app.get('/weather', async (req, res) => {
   var cityQuery = req.query.city
   if (cityQuery === undefined || cityQuery === "") {
      res.redirect('/')
      console.log('"city" is empty.')
   } else {
      const WAPI = "https://api.openweathermap.org/data/2.5/weather?q=" + cityQuery + "&units=metric&appid=" + process.env.WAPI_KEY
      
      https.get(WAPI, function(response) {
         response.on('data', function(data) {
            try {
               const wData = JSON.parse(data)
               //Location - Country, City, Coords
               const country = wData.sys.country
               const city = wData.name
               const coord_lon = wData.coord.lon
               const coord_lat = wData.coord.lat
               //Weather datas - Weather, Cloudiness, Humidity, Temperature, Wind
               const weather = wData.weather[0].description
               const cloudiness = wData.clouds.all
               const humidity = wData.main.humidity
               const temp = wData.main.temp
               const wind_speed = wData.wind.speed
               const wind_deg = wData.wind.deg
               //Since the data comes as unix, we convert it to normal time zone - Sunrise, Sunset
               const sunrise_unix = wData.sys.sunrise
               const sunset_unix = wData.sys.sunset
               const sunrise = new Date(sunrise_unix*1000).toLocaleTimeString(locale.Locale["default"])
               const sunset = new Date(sunset_unix*1000).toLocaleTimeString(locale.Locale["default"])
               //Pressures - Atmospheric, Sea Level, Ground Level
               const atmospher_hPa = wData.main.pressure
               const grnd_level_hPa = wData.main.grnd_level
               const sea_level_hPa = wData.main.sea_level
               //Weather icon
               const wDataIcon = wData.weather[0].icon
               const weatherIconLink = "https://openweathermap.org/img/wn/" + wDataIcon + ".png"
               res.render('weather', {
                  country: country,
                  city: city,
                  coord_lon: coord_lon,
                  coord_lat: coord_lat,
                  weather: weather,
                  cloudiness: cloudiness,
                  humidity: humidity,
                  temp: temp,
                  wind_speed: wind_speed,
                  wind_deg: wind_deg,
                  sunrise: sunrise,
                  sunset: sunset,
                  atmospher_hPa: atmospher_hPa,
                  sea_level_hPa: sea_level_hPa,
                  grnd_level_hPa: grnd_level_hPa,
                  weatherIcon: weatherIconLink,
                  weatherCss: weatherCss
               })
            } catch (err) {
               res.render('./404')
            }
         })
      })
   }
})

app.use((req, res) => {
   res.render('./404')
})

app.listen(process.env.APP_LISTEN_PORT || 4000)