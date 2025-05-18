const loader = document.getElementById("loader");
const searchBtn = document.getElementById("search-btn");
const cityInput = document.getElementById("city-input");

const cityNameElem = document.getElementById("city-name");
const tempElem = document.getElementById("temperature");
const descElem = document.getElementById("description");
const iconElem = document.getElementById("weather-icon");
const humidityElem = document.getElementById("humidity");
const windElem = document.getElementById("wind-speed");

const weatherCard = document.getElementById("weather-info");
const errorMessage = document.getElementById("error-message");

function showLoader() {
  loader.classList.remove("hidden");
  weatherCard.classList.add("hidden");
  errorMessage.classList.remove("visible");
}

function hideLoader() {
  loader.classList.add("hidden");
}

function showError(msg) {
  errorMessage.textContent = msg;
  errorMessage.classList.add("visible");
  weatherCard.classList.add("hidden");
}

function clearError() {
  errorMessage.classList.remove("visible");
}

function capitalizeWords(str) {
  return str.replace(/\b\w/g, char => char.toUpperCase());
}

function updateWeatherUI(data) {
  clearError();
  cityNameElem.textContent = `${data.name}, ${data.sys.country}`;
  tempElem.textContent = `${Math.round(data.main.temp)}°C`;
  descElem.textContent = capitalizeWords(data.weather[0].description);
  iconElem.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  iconElem.alt = data.weather[0].description;
  humidityElem.textContent = `${data.main.humidity}%`;
  windElem.textContent = `${data.wind.speed.toFixed(1)} km/h`;
  weatherCard.classList.remove("hidden");
}

// Weather by city
async function getWeatherByCity(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
  try {
    showLoader();
    const response = await fetch(url);
    const data = await response.json();
    hideLoader();

    if (response.status === 404 || data.cod === "404") {
      showError("🚫 City not found. Please check the name.");
      return;
    }

    updateWeatherUI(data);
  } catch {
    hideLoader();
    showError("⚠️ Network error. Please try again.");
  }
}

// Weather by coordinates
async function getWeatherByCoords(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  try {
    showLoader();
    const response = await fetch(url);
    const data = await response.json();
    hideLoader();
    updateWeatherUI(data);
  } catch {
    hideLoader();
    showError("⚠️ Failed to get weather for your location.");
  }
}

// Search button click
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city !== "") {
    getWeatherByCity(city);
  } else {
    showError("Please enter a city name.");
  }
});

// Enter key press
cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    searchBtn.click();
  }
});

// Auto-detect location
window.addEventListener("load", () => {
  showLoader(); // 👈 Show loader immediately

  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        getWeatherByCoords(latitude, longitude);
      },
      (error) => {
        hideLoader(); // 👈 Hide loader if geolocation fails

        let msg = "⚠️ Location access denied. Please search manually.";
        if (error.code === error.PERMISSION_DENIED) {
          msg = "🔒 You denied location access. Please allow it to see weather for your area.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = "⚠️ Location info unavailable.";
        } else if (error.code === error.TIMEOUT) {
          msg = "⏱️ Location request timed out. Please try again or search manually.";
        }
        showError(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 8000, // 👈 Faster timeout (8s)
        maximumAge: 0
      }
    );
  } else {
    hideLoader();
    showError("❌ Geolocation is not supported by this browser.");
  }
});
