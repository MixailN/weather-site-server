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
    for(let key of Object.keys(localStorage)) {
        let count = localStorage.getItem(key);
        console.log(key + "1");
        while(count--) {
            onloadFavoriteCity(key);
        }
    }
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
    let cityName = await getCityName(lat, lon);
    let answer = await getWeather(lat, lon);
    card.content.querySelectorAll(".current-city-name")[0].textContent = cityName;
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
}

async function getCityName(lat, lon) {
    return new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.responseType = "json";
        let city_url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}`;
        xhr.open("GET", city_url);
        xhr.onload = function() {
            if (xhr.status !== 200) {
                alert(`Ошибка ${xhr.status}: ${xhr.statusText}`);
            } else {
                let answer = xhr.response;
                resolve(answer.city);
            }
        };
        xhr.send();
    });

}

async function getWeather(lat, lon) {
    return new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.responseType = "json";
        let weather_url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        xhr.open("GET", weather_url);
        xhr.onload = function() {
            if (xhr.status !== 200) {
                alert(`Ошибка ${xhr.status}: ${xhr.statusText}`);
            } else {
                resolve(xhr.response);
            }
        };
        xhr.send();
    });
}

function geoFailure() {
    let weather_url = `https://api.openweathermap.org/data/2.5/weather?q=saint+petersburg&appid=${API_KEY}&units=metric`;
    let xhr = new XMLHttpRequest();
    xhr.responseType = "json";
    xhr.open("GET", weather_url);
    xhr.onload = function() {
        if (xhr.status !== 200) {
            alert(`Ошибка ${xhr.status}: ${xhr.statusText}`);
        } else {
            let answer = xhr.response;
            currentCityContainer.innerHTML = `
            <ul class="current-city">
                <li class="current-city-name-container">
                    <h2 class="current-city-name">Saint-Petersburg</h2>
                </li>
                <li class="weather-icon-container">
                    <img class="current-weather-icon" src="http://openweathermap.org/img/wn/${answer.weather[0].icon}@2x.png">
                </li>
                <li class="temperature-container">
                    <span class="current-temperature">${Math.round(answer.main.temp)}&degC</span>
                </li>
            </ul>
            <ul class="city-data">
                <li class="weather-data"><span class="title">Ветер</span> <span class="description">${degreesToDirections(answer.wind.deg)} ${answer.wind.speed}м/с</span></li>
                <li class="weather-data"><span class="title">Облачность</span> <span class="description">${answer.clouds.all}%</span></li>
                <li class="weather-data"><span class="title"> Давление</span><span class="description">${answer.main.pressure}гПа</span></li>
                <li class="weather-data"><span class="title">Влажность</span><span class="description">${answer.main.humidity}%</span></li>
                <li class="weather-data"><span class="title">Координаты</span><span class="description">[${Math.round(answer.coord.lon)}, ${Math.round(answer.coord.lat)}]</span></li>
            </ul>`;
        }
    };
    xhr.send();
}

function deleteCity(element) {
    console.log(element.parentElement);
    let header = element.parentElement;
    let li = header.parentElement;
    let key = header.children.item(0).textContent;
    let count = localStorage.getItem(key);
    if(parseInt(count) === 1) {
        console.log("if 1 " + count);
        localStorage.removeItem(key);
        li.remove();
    } else {
        console.log("if more 1 " + count);
        localStorage.setItem(key, `${count - 1}`);
        li.remove();
    }
}

function degreesToDirections(degree) {
    let index = Math.round((degree - 11.25) / 45);
    console.log(index);
    console.log(directions);
    return directions[index];
}