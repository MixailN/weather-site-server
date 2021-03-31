const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const pgp = require('pg-promise')(/*options*/);
const config = require("./config.json")

const app = express();
const API_KEY = '073dfd9227c6474136cdf93e299ca5f9';
const directions = ["северный", "северно-восточный", "восточный", "юго-восточный", "южный", "юго-западный", "западный", "северо-западный"];
const db = pgp(`postgres://${config.user}:${config.password}@localhost:5432/favoriteweather`);

function getWeather(weather_url, res) {
    fetch(weather_url).then(
        response => {
            console.log(`Response status: ${response.status}`);
            if(response.status === 200) {
                response.json().then(
                    data => res.json(data)
                )
            } else {
                res.statusCode = 404;
                res.statusMessage = 'Can not find that city';
                res.send();
            }
        }
    ).catch((e) => {
        console.log(e.message);
        res.statusCode = 404;
        res.statusMessage = 'Can not connect to weather API';
        res.send();
    })
}

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Headers', "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    next();
});

app.get('/weather/city', function (req, res) {
    console.log(`GET: ${req.url} \nData: ${req.query.q}`);
    let weather_url = `https://api.openweathermap.org/data/2.5/weather?q=${req.query.q}&appid=${API_KEY}&units=metric`;
    console.log(weather_url);
    getWeather(weather_url, res);
});

app.get('/weather/coordinates', function (req, res) {
    console.log(`GET: ${req.url} \nData: ${req.query.lat}, ${req.query.long}`);
    let weather_url = `https://api.openweathermap.org/data/2.5/weather?lat=${req.query.lat}&lon=${req.query.long}&appid=${API_KEY}&units=metric`;
    console.log(weather_url);
    fetch(weather_url).then(
        response => {
            console.log(`Response status: ${response.status}`);
            if(response.status === 200) {
                response.json().then(
                    data => res.json(data)
                )
            } else {
                res.statusCode = 404;
                res.send('Can not find that city');
            }
        }
    ).catch((e) => {
        console.log(e.message);
        res.statusCode = 404;
    })
});

app.post('/favorites', function (req, res) {
    console.log();
});

app.listen(3000);