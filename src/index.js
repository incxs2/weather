import "./styles.css";

let weatherData = null;
let structuredWeatherData = {};

async function getData(place) {
  if (weatherData) {
    return weatherData;
  }
  const data = await fetch(
    `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${place}?unitGroup=uk&key=Q5DNXR26ZTFQSQ6LL588W9GSQ`,
  );
  weatherData = await data.json();
  console.log(weatherData);
  return weatherData;
}

function formatData(data) {
  ((structuredWeatherData = {
    location: data.address,
    days: {},
    currentConditions: {
      time: data.currentConditions.datetime,
      temp: data.currentConditions.temp,
      conditions: data.currentConditions.conditions,
      icon: data.currentConditions.icon,
      precip: data.currentConditions.precip,
      humid: data.currentConditions.humidity,
    },
  }),
    data.days.forEach((day) => {
      structuredWeatherData.days[day.datetime] = day.hours.map((hour) => ({
        temp: hour.temp,
        conditions: hour.conditions,
        icon: hour.icon,
        precip: hour.precip,
        humid: hour.humidity,
        wind: hour.windspeed,
      }));
    }));

  return structuredWeatherData;
}

let now;
function getCurrentDayHour() {
  now = new Date();
  now = {
    day: `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`,
    time: `${now.getHours()}:${now.getMinutes()}`,
  };
}

function setDom() {
  return {
    location: document.querySelector(".location"),
    date: document.querySelector(".date"),
    time: document.querySelector(".time"),
    icon: document.querySelector(".icon img"),
    temp: document.querySelector(".temp"),
    weather: document.querySelector(".weather"),
    precip: document.querySelector(".precip"),
    humid: document.querySelector(".humid"),
    wind: document.querySelector(".wind"),
  };
}

async function main(desiredLocation) {
  getCurrentDayHour();
  let target = {
    location: desiredLocation,
    date: now.day,
    time: `${now.time.slice(0, 2)}`,
    fulltime: now.time,
  };
  let raw;
  try {
    raw = await getData(target.location);
  } catch (err) {
    console.error("Unable to fetch:", err);
    return;
  }
  const data = formatData(raw);
  console.log(data);
  let tempLabel = "°c";
  console.log(target);
  const dom = setDom();
  function updateDom() {
    const formattedLocation = data.location
      .split("-")
      .map((w) => {
        if (w === "on") return w;
        return w[0].toUpperCase() + w.slice(1);
      })
      .join("-");

    dom.location.textContent = formattedLocation;
    dom.date.textContent = target.date;
    dom.time.textContent = `${target.time}:00`;
    dom.temp.textContent = data.days[target.date][target.time].temp + tempLabel;
    dom.weather.textContent = data.days[target.date][target.time].conditions;
    dom.precip.textContent = data.days[target.date][target.time].precip;
    dom.humid.textContent = data.days[target.date][target.time].humid;
    dom.wind.textContent = data.days[target.date][target.time].wind;
    dom.icon.src = require(
      `./icons/${data.days[target.date][target.time].icon}.svg`,
    );
  }
  updateDom();
  document.querySelector(".time").textContent = now.time;
}

main("stoke-on-trent");
