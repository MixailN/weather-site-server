const currentCityContainer = document.getElementsByClassName("current-city-container")[0];
const API_KEY = "073dfd9227c6474136cdf93e299ca5f9";
const form = document.getElementsByClassName("search-form")[0];
const input = document.getElementsByClassName("search-field")[0];
const directions = ["северный", "северно-восточный", "восточный", "юго-восточный", "южный", "юго-западный", "западный", "северо-западный"];
const refreshButton = document.getElementsByClassName("refresh-geo")[0];
const favoriteLoader = document.getElementById("favorite-city-loader");
const favoriteCityCard = document.getElementById("favorite-city-card");
const favoriteList = document.getElementsByClassName("favorites")[0];

form.addEventListener('submit', function (event) {
    let message = input.value;
    getFavoriteCity(message);
    form.reset();
    event.preventDefault();
});

document.addEventListener('click', function (event) {
    let target = event.target;
    if(target.className.match("close-button")){
        deleteCity(target);
    }
});

refreshButton.addEventListener('click', getLocation);

document.addEventListener('DOMContentLoaded', init);



function init() {
    //localStorage.clear();
    getLocation();
    let favoritesUrl = `http://localhost:3000/favorites`;
    let xhr = new XMLHttpRequest();
    xhr.responseType = "json";
    xhr.open('GET', favoritesUrl);
    xhr.send();
    xhr.onload =function () {
        if(xhr.status !== 200) {
            alert('Ошибка соединения');
        } else {
            let answer = xhr.response;
            for (let i = 0; i < answer.length; i++) {
                console.log(answer[i]);
                onloadFavoriteCity(answer[i].city_name);
            }
        }
    };
    xhr.onerror = function () {
        alert("Ошибка соединения");
    };
}

function clearLocal() {
    localStorage.clear();
}

function addFavoriteCard(answer) {
    favoriteCityCard.content.querySelectorAll(".favorite-city-name")[0].textContent = `${answer.name}`;
    favoriteCityCard.content.querySelectorAll(".favorite-temperature")[0].textContent =
        `${Math.round(answer.main.temp)}\u00B0C`;
    favoriteCityCard.content.querySelectorAll(".weather-icon")[0].src =
        `http://openweathermap.org/img/wn/${answer.weather[0].icon}@2x.png`;
    let weatherData = favoriteCityCard.content.querySelectorAll(".description");
    weatherData[0].textContent = `${degreesToDirections(answer.wind.deg)} ${answer.wind.speed}м/с`;
    weatherData[1].textContent = `${answer.clouds.all}%`;
    weatherData[2].textContent = `${answer.main.pressure}гПа`;
    weatherData[3].textContent = `${answer.main.humidity}%`;
    weatherData[4].textContent = `[${Math.round(answer.coord.lon)}, ${Math.round(answer.coord.lat)}]`;
    const liCity = document.createElement("li");
    favoriteList.appendChild(liCity);
    liCity.appendChild(document.importNode(favoriteCityCard.content, true));
}

function onloadFavoriteCity(name) {
    let weather_url = `http://localhost:3000/weather/city?q=${name}`;
    let xhr = new XMLHttpRequest();
    const liLoader = document.createElement("li");
    favoriteList.appendChild(liLoader);
    liLoader.appendChild(document.importNode(favoriteLoader.content, true));
    xhr.responseType = "json";
    xhr.open("GET", weather_url);
    xhr.send();
    xhr.onload = function() {
        if (xhr.status !== 200) {
            alert(`Ошибка ${xhr.status}: ${xhr.statusText}`);
            liLoader.remove();
        } else {
            let answer = xhr.response;
            liLoader.remove();
            addFavoriteCard(answer);
        }
    }
    xhr.onerror = function () {
        alert("Ошибка соединения");
        liLoader.remove();
    }
}

function getFavoriteCity(name){
    let weatherUrl = `http://localhost:3000/weather/city?q=${name}`;
    let xhr = new XMLHttpRequest();
    const liLoader = document.createElement("li");
    favoriteList.appendChild(liLoader);
    liLoader.appendChild(document.importNode(favoriteLoader.content, true));
    xhr.responseType = "json";
    xhr.open("GET", weatherUrl);
    xhr.send();
    xhr.onload = function() {
        if (xhr.status !== 200) {
            alert(`Ошибка ${xhr.status}: ${xhr.statusText}`);
            liLoader.remove();
        } else {
            let answer = xhr.response;
            let postUrl = `http://localhost:3000/favorites?q=${answer.name}`;
            let xhr2 = new XMLHttpRequest();
            xhr2.open('POST', postUrl);
            xhr2.send();
            xhr2.onload = function () {
                if(xhr2.status !== 200) {
                    alert(`Ошибка ${xhr.status}: ${xhr.statusText}`);
                    liLoader.remove();
                } else {
                    liLoader.remove();
                    addFavoriteCard(answer);
                }
            }
            xhr2.onerror = function () {
                alert("Ошибка подключения к базе данных");
                liLoader.remove();
            }
            let count = localStorage.getItem(answer.name);
            if(count == null) {
                localStorage.setItem(answer.name, "1");
            } else {
                localStorage.setItem(answer.name, `${parseInt(count) + 1}`);
            }
        }
    }
    xhr.onerror = function () {
        alert("Ошибка соединения");
        liLoader.remove();
    }
}

function getLocation() {
    if(navigator.geolocation) {
        geo = navigator.geolocation.getCurrentPosition(geoSuccess, geoFailure);
    } else {
        alert("Your browser doesn't support geolocation");
    }
}

async function geoSuccess(position) {
    let lat = position.coords.latitude;
    let lon = position.coords.longitude;
    await getCurrentWeather(lat, lon);
}

async function getWeather(lat, lon) {
    return new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.responseType = "json";
        let weather_url = `http://localhost:3000/weather/coordinates?lat=${lat}&long=${lon}`;
        xhr.open("GET", weather_url);
        xhr.send();
        xhr.onload = function() {
            if (xhr.status !== 200) {
                alert(`Ошибка ${xhr.status}: ${xhr.statusText}`);
            } else {
                resolve(xhr.response);
            }
        };
        xhr.onerror = function () {
            alert('Ошибка соединения');
            resolve(undefined);
        };
    });
}

async function geoFailure() {
    let lat = 59;
    let lon = 30;
    await getCurrentWeather(lat, lon);
}

async function getCurrentWeather(lat, lon) {
    console.log(document.getElementsByClassName("current-city-container").length);
    if(document.getElementsByClassName("current-city-container").length !== 0) {
        document.getElementsByClassName("current-city-container")[0].remove();
    }
    const loader = document.getElementById("current-city-loader");
    const card = document.getElementById("current-city-card");
    const divLoader = document.createElement("div");
    const nextElement = document.getElementsByClassName("favorites-header")[0];
    const parentElement = nextElement.parentElement;
    divLoader.classList.add("current-city-container");
    divLoader.appendChild(document.importNode(loader.content, true));
    parentElement.insertBefore(divLoader, nextElement);
    let answer = await getWeather(lat, lon);
    if(answer !== undefined) {
        card.content.querySelectorAll(".current-city-name")[0].textContent = answer.name;
        card.content.querySelectorAll(".current-weather-icon")[0].src =
            `http://openweathermap.org/img/wn/${answer.weather[0].icon}@2x.png`;
        card.content.querySelectorAll(".current-temperature")[0].textContent = `${Math.round(answer.main.temp)}\u00B0C`;
        let weatherData = card.content.querySelectorAll(".description");
        weatherData[0].textContent = `${degreesToDirections(answer.wind.deg)} ${answer.wind.speed}м/с`;
        weatherData[1].textContent = `${answer.clouds.all}%`;
        weatherData[2].textContent = `${answer.main.pressure}гПа`;
        weatherData[3].textContent = `${answer.main.humidity}%`;
        weatherData[4].textContent = `[${Math.round(answer.coord.lon)}, ${Math.round(answer.coord.lat)}]`;
        divLoader.remove();
        const divCity = document.createElement("div");
        divCity.classList.add("current-city-container");
        divCity.appendChild(document.importNode(card.content, true));
        parentElement.insertBefore(divCity, nextElement);
    } else {
        let element = document.getElementsByClassName('loading-box')[0];
        element.children[0].textContent = 'Ошибка загрузки';
    }
}

function deleteCity(element) {
    console.log(element.parentElement);
    element.disabled = true;
    let header = element.parentElement;
    let li = header.parentElement;
    let key = header.children.item(0).textContent;
    let xhr = new XMLHttpRequest();
    let deleteUrl = `http://localhost:3000/favorites?q=${key}`;
    xhr.open('DELETE', deleteUrl);
    xhr.send();
    xhr.onload = function () {
        if(xhr.status !== 200){
            alert(`Ошибка ${xhr.status}: ${xhr.statusText}`);
            element.disabled = false;
        } else {
            li.remove();
        }
    };
    xhr.onerror = function () {
        alert("Ошибка соединения");
        element.disabled = false;
    };
}

function degreesToDirections(degree) {
    let index = Math.round((degree - 11.25) / 45);
    console.log(index);
    console.log(directions);
    return directions[index];
}