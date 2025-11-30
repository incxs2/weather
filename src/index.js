import "./styles.css";

let weatherData = null;
let structuredWeatherData = {};

async function getData(place) {
  if (weatherData?.location === place) {
    return weatherData;
  }
  const data = await fetch(
    `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${place}?unitGroup=uk&key=Q5DNXR26ZTFQSQ6LL588W9GSQ`,
  );
  weatherData = await data.json();
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
    time: `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`,
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
  console.log(data)
  let tempLabel = "°c";
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

  const xSpacing = 83
  let c = document.querySelector("canvas");
  let ctx = c.getContext("2d");
  c.width=c.offsetWidth;
  c.height = c.offsetHeight;
  ctx.clearRect(0,0, c.offsetWidth, c.offsetHeight);
  ctx.font = "24px Arial";
  ctx.fillText("°c", 0, 20)
  ctx.moveTo(20, 25)
  ctx.lineTo(25, 25);
  ctx.lineTo(25, 273);
  ctx.lineTo(690, 273)
  ctx.moveTo(25,278)
  ctx.lineTo(25,273)
  ctx.lineTo(20,273)


  ctx.font = "16px Arial"

  for (let i = 0; i < 8; i++) {
    ctx.moveTo(108+(i*xSpacing),278);
    ctx.lineTo(108+(i*xSpacing),273);
    ctx.fillText(`${String(3*i).padStart(2,"0")}:00`,5+(i*xSpacing), 293)
  }

  ctx.stroke()

  const dayHours = data.days[target.date]
  const minTemp = dayHours.reduce((min, hour) => {
    return hour.temp < min ? hour.temp : min
  }, Infinity)
  const maxTemp = dayHours.reduce((max, hour) => {
    return hour.temp > max ? hour.temp : max
  }, -Infinity)

  ctx.fillText(Math.floor(minTemp), 5, 273)
  ctx.fillText(Math.ceil(maxTemp),5, 40)

  const xMin = 25
  const yMin = 278
  const xMax = 689
  const yMax = 25


  const yCoords = []

  data.days[target.date].forEach((hour, i) => {
    let proportionOfMax = (hour.temp - Math.floor(minTemp))/(Math.ceil(maxTemp)-Math.floor(minTemp))
    let yCoord = ((1-proportionOfMax)*(278-25))+25
    yCoords.push(yCoord)
  })

  ctx.moveTo(xMin,yCoords[0])

  ctx.font = "8px Arial"

  yCoords.forEach((y, i) => {
    ctx.lineTo((((xMax-xMin)/24)*i)+xMin,y)
    ctx.fillText(dayHours[i].temp,(((xMax-xMin)/24)*i)+(xMin*0.8),y-15)
  })

  ctx.stroke()
}


main("london")