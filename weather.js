const btn = document.getElementById('btn');
const cityInput = document.getElementById('city');
const API_KEY = '171e009cae7e126fcbcec49c3a5cee6a'; // Your OpenWeatherMap API key

// Chart objects to store references
let charts = {
  temperature: null,
  humidity: null,
  pressure: null,
  wind: null
};

// Allow search on Enter key press
cityInput.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    getWeatherData();
  }
});

btn.addEventListener('click', getWeatherData);

// Set up tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    // Remove active class from all tabs
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    // Add active class to clicked tab
    this.classList.add('active');
    
    // Show the selected chart
    showChart(this.dataset.chart);
  });
});

function getWeatherData() {
  const city = cityInput.value.trim();
  if (!city) return;
  
  const result = document.getElementById('result');
  result.innerHTML = '<div style="text-align: center; padding: 20px;"><i class="fas fa-spinner fa-spin" style="font-size: 30px;"></i><p style="margin-top: 10px;">Fetching weather data...</p></div>';
  
  // Get current weather data
  getCurrentWeather(city);
  
  // Get forecast data for charts
  getForecastData(city);
}

function getCurrentWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`;
  
  fetch(url)
    .then(response => response.json())
    .then(data => {
      displayWeather(data);
    })
    .catch(error => {
      console.error('Error:', error);
      const result = document.getElementById('result');
      result.innerHTML = '<div style="text-align: center; padding: 20px; color: #ff6b6b;"><i class="fas fa-exclamation-circle" style="font-size: 30px;"></i><p style="margin-top: 10px;">Something went wrong. Please try again.</p></div>';
    });
}

function getForecastData(city) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}`;
  
  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.cod === '200') {
        // Process and display forecast data
        processForecastData(data);
        // Show the forecast container
        document.getElementById('forecast-container').style.display = 'block';
      }
    })
    .catch(error => {
      console.error('Error fetching forecast:', error);
    });
}

function processForecastData(data) {
  // Extract data for charts
  const forecastList = data.list;
  
  // Arrays to store data for charts
  const labels = [];
  const tempData = [];
  const humidityData = [];
  const pressureData = [];
  const windData = [];
  
  // Process data for the next 5 days (every 3 hours)
  forecastList.forEach((item, index) => {
    // Only use every 3rd data point to avoid overcrowding (or adjust as needed)
    if (index % 2 === 0 && index < 20) {
      const date = new Date(item.dt * 1000);
      
      // Format date as day and time
      const formattedDate = `${date.getDate()}/${date.getMonth()+1} ${date.getHours()}:00`;
      
      labels.push(formattedDate);
      tempData.push((item.main.temp - 273.15).toFixed(1)); // Convert to Celsius
      humidityData.push(item.main.humidity);
      pressureData.push(item.main.pressure);
      windData.push(item.wind.speed);
    }
  });
  
  // Setup chart containers
  setupChartContainers();
  
  // Create charts
  createTemperatureChart(labels, tempData);
  createHumidityChart(labels, humidityData);
  createPressureChart(labels, pressureData);
  createWindChart(labels, windData);
  
  // Show temperature chart by default
  showChart('temperature');
}

function setupChartContainers() {
  const forecastContainer = document.getElementById('forecast-container');
  
  // Clear existing chart containers
  forecastContainer.innerHTML = '';
  
  // Create containers for each chart type
  const chartTypes = ['temperature', 'humidity', 'pressure', 'wind'];
  
  chartTypes.forEach(type => {
    const container = document.createElement('div');
    container.className = 'chart-container';
    container.id = `${type}-chart-container`;
    container.style.display = type === 'temperature' ? 'block' : 'none';
    
    const canvas = document.createElement('canvas');
    canvas.id = `${type}Chart`;
    
    container.appendChild(canvas);
    forecastContainer.appendChild(container);
  });
  
  // Add the tab buttons
  const tabsContainer = document.createElement('div');
  tabsContainer.className = 'chart-tabs';
  
  tabsContainer.innerHTML = `
    <button class="tab-btn active" data-chart="temperature">Temperature</button>
    <button class="tab-btn" data-chart="humidity">Humidity</button>
    <button class="tab-btn" data-chart="pressure">Pressure</button>
    <button class="tab-btn" data-chart="wind">Wind</button>
  `;
  
  forecastContainer.appendChild(tabsContainer);
  
  // Set up tab switching
  tabsContainer.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      // Remove active class from all tabs
      tabsContainer.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      // Add active class to clicked tab
      this.classList.add('active');
      
      // Show the selected chart
      showChart(this.dataset.chart);
    });
  });
}

function createTemperatureChart(labels, data) {
  const ctx = document.getElementById('temperatureChart').getContext('2d');
  
  // Destroy existing chart if it exists
  if (charts.temperature) {
    charts.temperature.destroy();
  }
  
  charts.temperature = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Temperature (°C)',
        data: data,
        borderColor: '#FF9F43',
        backgroundColor: 'rgba(255, 159, 67, 0.2)',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointBackgroundColor: '#FF9F43',
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#fff'
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        y: {
          ticks: {
            color: '#fff'
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        },
        x: {
          ticks: {
            color: '#fff'
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        }
      }
    }
  });
}

function createHumidityChart(labels, data) {
  const ctx = document.getElementById('humidityChart').getContext('2d');
  
  // Destroy existing chart if it exists
  if (charts.humidity) {
    charts.humidity.destroy();
  }
  
  charts.humidity = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Humidity (%)',
        data: data,
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointBackgroundColor: '#4CAF50',
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#fff'
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        y: {
          ticks: {
            color: '#fff'
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        },
        x: {
          ticks: {
            color: '#fff'
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        }
      }
    }
  });
}

function createPressureChart(labels, data) {
  const ctx = document.getElementById('pressureChart').getContext('2d');
  
  // Destroy existing chart if it exists
  if (charts.pressure) {
    charts.pressure.destroy();
  }
  
  charts.pressure = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Pressure (hPa)',
        data: data,
        borderColor: '#7B68EE',
        backgroundColor: 'rgba(123, 104, 238, 0.2)',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointBackgroundColor: '#7B68EE',
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#fff'
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        y: {
          ticks: {
            color: '#fff'
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        },
        x: {
          ticks: {
            color: '#fff'
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        }
      }
    }
  });
}

function createWindChart(labels, data) {
  const ctx = document.getElementById('windChart').getContext('2d');
  
  // Destroy existing chart if it exists
  if (charts.wind) {
    charts.wind.destroy();
  }
  
  charts.wind = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Wind Speed (m/s)',
        data: data,
        backgroundColor: 'rgba(41, 128, 185, 0.7)',
        borderColor: '#2980b9',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#fff'
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        y: {
          ticks: {
            color: '#fff'
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        },
        x: {
          ticks: {
            color: '#fff'
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        }
      }
    }
  });
}

function showChart(chartType) {
  // Hide all chart containers
  document.querySelectorAll('.chart-container').forEach(container => {
    container.style.display = 'none';
  });
  
  // Show the selected chart container
  document.getElementById(`${chartType}-chart-container`).style.display = 'block';
}

function displayWeather(data) {
  const result = document.getElementById('result');
  if (data.cod === '404') {
    result.innerHTML = '<div style="text-align: center; padding: 20px; color: #ff6b6b;"><i class="fas fa-map-marker-alt" style="font-size: 30px;"></i><p style="margin-top: 10px;">City not found. Please check the spelling and try again.</p></div>';
  } else {
    // Get weather icon
    const iconCode = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    
    result.innerHTML = `
      <h2 style="font-family: 'Poppins', sans-serif; display: flex; align-items: center; justify-content: center;">
        <img src="${iconUrl}" alt="${data.weather[0].description}" style="width: 50px; height: 50px;">
        ${data.name}, ${data.sys.country}
      </h2>
      <div class="weather-info">
        <div class="weather-row">
          <div class="weather-icon"><i class="fas fa-temperature-high"></i></div>
          <div>Temperature: ${Math.round(data.main.temp -273.15)}°C</div>
        </div>
        <div class="weather-row">
          <div class="weather-icon"><i class="fas fa-thermometer"></i></div>
          <div>Feels like: ${Math.round(data.main.feels_like -273.15)}°C</div>
        </div>
        <div class="weather-row">
          <div class="weather-icon"><i class="fas fa-cloud"></i></div>
          <div>Weather: ${data.weather[0].main} (${data.weather[0].description})</div>
        </div>
        <div class="weather-row">
          <div class="weather-icon"><i class="fas fa-tint"></i></div>
          <div>Humidity: ${data.main.humidity}%</div>
        </div>
        <div class="weather-row">
          <div class="weather-icon"><i class="fas fa-compress-alt"></i></div>
          <div>Pressure: ${data.main.pressure} hPa</div>
        </div>
        <div class="weather-row">
          <div class="weather-icon"><i class="fas fa-wind"></i></div>
          <div>Wind: ${data.wind.speed} m/s, ${getWindDirection(data.wind.deg)}</div>
        </div>
      </div>`;
  }
}

function getWindDirection(degrees) {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions[Math.round(degrees / 45) % 8];
}