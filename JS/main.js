// DOM Selection
const spinner = document.getElementById("spinner")
const city = document.getElementById("city");
const dayName = document.getElementById("day-name");
const dayDate = document.getElementById("day-date");
const curTemp = document.getElementById("temp-now");
const weatherCond = document.getElementById("weather-desc");
const weatherImg = document.getElementById("weather-img");
const realFeel = document.getElementById("real-feel");
const wind = document.getElementById("wind");
const humidity = document.getElementById("humidity");
const uvIndex = document.getElementById("uv-index");
const todayHours = document.querySelectorAll(".hourly .row .col");
const sevenDays = document.querySelectorAll(".right-side .day");
const searchInput = document.getElementById("search")

// Variables Declaretion
let worldCountries = [];
const newDate = new Date();
const weekDays = ["Sun", "Mon", "The", "Wed", "Thu", "Fri", "Sat"];
const monthDays = ["Jun", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Get cashes data from local storage
if (localStorage.getItem("city")) {
  getData(localStorage.getItem("city"));
} else if (localStorage.getItem("weather")) {
  console.log(5)
  curWeather(JSON.parse(localStorage.getItem("weather")));
  todayWeather(JSON.parse(localStorage.getItem("weather")));
  weekweather(JSON.parse(localStorage.getItem("weather")));
}

// Function Declaretion
setTimeout(() => {
  spinner.classList.add("opacity-0")
  spinner.classList.add("z-n1")
}, 1500);

async function getData(city) {
  try {
    let req = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=83e311010753432981b135112250407&q=${city}&days=7`);
    let response = await req.json();
    localStorage.setItem("weather", JSON.stringify(response))
    curWeather(response);
    todayWeather(response);
    weekweather(response)

  } catch (error) {
    console.log(error);
  }
}

function curWeather(response) {
  city.textContent = `${response.location.name}`;
  dayName.textContent = `${weekDays[newDate.getDay()]}`;
  dayDate.textContent = `${newDate.getDate()}, ${monthDays[newDate.getMonth()]}`;
  curTemp.textContent = `${response.current.temp_c}`;
  weatherCond.textContent = `${response.current.condition.text}`;
  weatherImg.src = `${response.current.condition.icon}`;
  realFeel.textContent = `${response.current.feelslike_c}`;
  wind.textContent = `${response.current.wind_kph} kph`;
  humidity.textContent = `${response.current.humidity}%`;
  uvIndex.textContent = `${response.current.uv}`;
}

function todayWeather(response) {
  const curDay = response.forecast.forecastday[0].hour;
  let index = 6;
  todayHours.forEach((hour) => {
    let x = new Date(curDay[index].time);
    hour.firstElementChild.children[0].textContent = `${x.getHours() > 12 ? x.getHours() - 12 : x.getHours()}:00 ${index > 10 ? "PM" : "AM"}`;
    hour.firstElementChild.children[1].src = `${curDay[index].condition.icon}`;
    hour.firstElementChild.children[2].textContent = `${curDay[index].temp_c}`;
    index += 3;
  })
}

function weekweather(response) {
  sevenDays.forEach((day, index) => {
    let curDayDate = new Date(response.forecast.forecastday[index].date)
    day.children[0].textContent = weekDays[curDayDate.getDay()];
    day.children[1].children[0].src = `${response.forecast.forecastday[index].day.condition.icon}`
    day.children[1].children[1].textContent = `${response.forecast.forecastday[index].day.condition.text}`;
    day.children[2].children[0].textContent = `${response.forecast.forecastday[index].day.maxtemp_c}`;
    day.children[2].children[1].textContent = `${response.forecast.forecastday[index].day.mintemp_c}`;
  });
}

function getLocation() {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve(position.coords);
        },
        (err) => reject(err)
      )
    }
  })
}

async function getCity(position) {
  try {
    position = position || JSON.parse(localStorage.getItem("position"));
    let req = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${position.latitude}&lon=${position.longitude}&format=json&accept-language=en`);
    let res = await req.json();
    let city = res.address.country.toLowerCase();
    localStorage.setItem("city", city)
    return city;
  } catch (err) {
    console.log(err);
    return localStorage.getItem("city");
  }
}

async function getAllCountries() {
  try {
    let req = await fetch("https://restcountries.com/v3.1/all?fields=name,capital");
    let res = await req.json();
    res.forEach(country => {
      worldCountries.push(country.name.common, country.capital);
    })
  } catch (err) {
    console.log(err)
  }
}

function validate(input) {
  const regex = /^[a-z\s]+$/i;
  if (!regex.test(input.value)) {
    input.value = input.value.replace(/[^a-z]/ig, "");
  }
}


getAllCountries()
getLocation().then(getCity).then(getData);


function findCity(input) {
  validate(input);
  let matches = worldCountries.flat().filter(country => country.toLowerCase().includes(input.value.toLowerCase()));

  if (matches.length > 0 && matches.length < 5) {
    console.log(matches)
    let isMatch = matches.filter(match => match.toLowerCase() === input.value.toLowerCase());
    if (isMatch.length > 0) {
      console.log(isMatch)
      getData(isMatch[0])
    } else {
      let x = ".".repeat(100);
      matches.forEach(match => {
        if (match.length < x.length) {
          x = match
        }
      })
      getData(x)
    }
  } else {
    getData(localStorage.getItem("city"))
  }
}


// DOM Events
searchInput.oninput = function () {
  findCity(this)
}

document.forms[0].onsubmit = function (e) {
  e.preventDefault();
  findCity(searchInput)
  searchInput.value = null;
}
