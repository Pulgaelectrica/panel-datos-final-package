const API_KEY = "a416a80fc2msh980bceb7140f6bcp19111fjsnd6dbc9d14818";

const symbols = {
  btc: "BTC-EUR",
  oro: "XAU-EUR",
  sp500: "^GSPC",
  nvda: "NVDA",
  tsla: "TSLA",
  aapl: "AAPL",
  amzn: "AMZN",
  googl: "GOOGL"
};

async function fetchData(symbol) {
  const url = `https://yahoo-finance15.p.rapidapi.com/api/yahoo/qu/quote/${symbol}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": API_KEY,
      "X-RapidAPI-Host": "yahoo-finance15.p.rapidapi.com"
    }
  });

  const data = await response.json();
  return data[0]; // Yahoo Finance devuelve array con 1 elemento
}

async function fetchChart(symbol) {
  const url = `https://yahoo-finance15.p.rapidapi.com/api/yahoo/hi/history/${symbol}/1d`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": API_KEY,
      "X-RapidAPI-Host": "yahoo-finance15.p.rapidapi.com"
    }
  });

  const data = await response.json();
  return data.items.map(i => i.close);
}

function drawChart(canvas, series, green) {
  const ctx = canvas.getContext("2d");
  const w = canvas.width = canvas.clientWidth;
  const h = canvas.height = canvas.clientHeight;

  ctx.clearRect(0, 0, w, h);

  ctx.strokeStyle = green ? "#00ff00" : "#ff0000";
  ctx.lineWidth = 2;
  ctx.beginPath();

  const max = Math.max(...series);
  const min = Math.min(...series);
  const range = max - min;

  series.forEach((v, i) => {
    const x = (i / (series.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();
}

async function updateCard(id, symbol) {
  const card = document.getElementById(id);
  const priceDiv = card.querySelector(".price");
  const canvas = card.querySelector("canvas");

  try {
    const quote = await fetchData(symbol);
    const series = await fetchChart(symbol);

    const price = quote.ask || quote.regularMarketPrice;
    const prev = quote.regularMarketPreviousClose || price;
    const green = price >= prev;

    priceDiv.textContent = price.toFixed(2);
    card.style.background = green ? "#003300" : "#330000";

    drawChart(canvas, series, green);

  } catch (e) {
    priceDiv.textContent = "ERR";
    console.error("Error en", symbol, e);
  }
}

function updateAll() {
  Object.entries(symbols).forEach(([id, symbol]) => {
    updateCard(id, symbol);
  });
}

updateAll();
setInterval(updateAll, 60000);
