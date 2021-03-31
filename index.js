const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const pgp = require('pg-promise')(/*options*/);
const config = require("./config.json")

const app = express();
const API_KEY = '073dfd9227c6474136cdf93e299ca5f9';
const directions = ["северный", "северно-восточный", "восточный", "юго-восточный", "южный", "юго-западный", "западный", "северо-западный"];
const db = pgp(`postgres://${config.user}:${config.password}@localhost:5432/favoriteweather`);

function degreesToDirections(degree) {
    let index = Math.round((degree - 11.25) / 45);
    return directions[index];
}

app.get('/weather/city', function (req, res) {
    console.log(`GET: ${req.url} \nData: ${req.query.q}`);
    let weather_url = `https://api.openweathermap.org/data/2.5/weather?q=${req.query.q}&appid=${API_KEY}&units=metric`;
    console.log(weather_url);
    fetch(weather_url).then(
        response => response.json()
    ).then(
        data => {
            res.json(data);
        }
    )
});

app.get('/weather/coordinates', function (req, res) {
    console.log(`GET: ${req.url} \nData: ${req.query.lat}, ${req.query.long}`);
    let weather_url = `https://api.openweathermap.org/data/2.5/weather?lat=${req.query.lat}&lon=${req.query.long}&appid=${API_KEY}&units=metric`;
    console.log(weather_url);
    fetch(weather_url).then(
        response => response.json()
    ).then(
        data => {
            res.json(data);
        }
    )
});

app.post('/favorites', function (req, res) {
    console.log();
});

app.listen(3000);