const apiURL = "https://api.openweathermap.org/data/2.5/weather?&units=metric&q="
const apiKey = "18c52ac0ab056f196470fe7c00518688"

const searchInput = document.querySelector(".search input")
const searchbtn = document.querySelector(".search button")
const weatherIcon = document.querySelector(".weather-icon")

/**
 * Weather condition to icon class mapping
 * Maps OpenWeather API icon codes to CSS classes for dynamic icon rendering
 */
const weatherIconMap = {
  // Clear sky
  "01d": "weather-sunny",
  "01n": "weather-moon",

  // Few clouds
  "02d": "weather-partly-cloudy-day",
  "02n": "weather-partly-cloudy-night",

  // Scattered clouds
  "03d": "weather-cloudy",
  "03n": "weather-cloudy",

  // Broken clouds
  "04d": "weather-overcast",
  "04n": "weather-overcast",

  // Shower rain
  "09d": "weather-rain-heavy",
  "09n": "weather-rain-heavy",

  // Rain
  "10d": "weather-rain",
  "10n": "weather-rain",

  // Thunderstorm
  "11d": "weather-thunderstorm",
  "11n": "weather-thunderstorm",

  // Snow
  "13d": "weather-snow",
  "13n": "weather-snow",

  // Mist/Fog
  "50d": "weather-fog",
  "50n": "weather-fog",
}

/**
 * Maps weather condition code to appropriate CSS icon class
 * @param {string} iconCode - Weather icon code from OpenWeather API
 * @returns {string} CSS class name for the weather icon
 */
function getWeatherIconClass(iconCode) {
  return weatherIconMap[iconCode] || "weather-cloudy" // Default fallback to cloudy
}

/**
 * Updates the weather icon by swapping CSS classes
 * Removes all existing weather icon classes and applies the new one
 * @param {string} iconCode - Weather icon code from API response
 */
function updateWeatherIcon(iconCode) {
  // Remove all existing weather icon classes to prevent conflicts
  const iconClasses = Object.values(weatherIconMap)
  weatherIcon.classList.remove(...iconClasses, "weather-loading")

  // Apply the new weather icon class based on current conditions
  const newIconClass = getWeatherIconClass(iconCode)
  weatherIcon.classList.add(newIconClass)

  console.log(`Weather icon updated to: ${newIconClass} (code: ${iconCode})`)
}

/**
 * Updates supplementary weather data icons
 * Applies CSS classes to display additional weather information
 * @param {Object} weatherData - Complete weather data from API
 */
function updateSupplementaryIcons(weatherData) {
  // Update wind direction icon based on wind degrees
  const windElement = document.querySelector(".wind-icon")
  if (windElement && weatherData.wind) {
    const windDegree = weatherData.wind.deg || 0
    windElement.style.transform = `rotate(${windDegree}deg)`
  }

  // Update UV index if available (requires additional API call in real implementation)
  const uvElement = document.querySelector(".uv-icon")
  if (uvElement) {
    // Placeholder for UV index - would need additional API call
    uvElement.classList.add("uv-moderate")
  }

  // Update visibility icon based on visibility data
  const visibilityElement = document.querySelector(".visibility-icon")
  if (visibilityElement && weatherData.visibility) {
    const visibility = weatherData.visibility / 1000 // Convert to km
    if (visibility < 1) {
      visibilityElement.classList.add("visibility-poor")
    } else if (visibility < 5) {
      visibilityElement.classList.add("visibility-moderate")
    } else {
      visibilityElement.classList.add("visibility-good")
    }
  }

  console.log("Supplementary icons updated")
}

/**
 * Shows loading state while fetching weather data
 */
function showLoadingState() {
  const iconClasses = Object.values(weatherIconMap)
  weatherIcon.classList.remove(...iconClasses)
  weatherIcon.classList.add("weather-loading")
}

/**
 * Handles search button click event
 */
function handleSearch() {
  const city = searchInput.value.trim()
  if (city) {
    checkweather(city)
  }
}

// Event listeners for user interactions
searchbtn.addEventListener("click", handleSearch)

searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    handleSearch()
  }
})

/**
 * Fetches weather data for specified city and updates UI
 * Uses async/await pattern with comprehensive error handling
 * @param {string} city - City name to get weather for
 */
async function checkweather(city) {
  try {
    // Step 1: Show loading state while fetching data
    showLoadingState()

    // Step 2: Fetch weather data from OpenWeather API
    const response = await fetch(`${apiURL}${city}&appid=${apiKey}`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    // Step 3: Check if city was found in API response
    if (data.cod === "404") {
      throw new Error("City not found")
    }

    console.log("Weather data received:", data)

    // Step 4: Update primary weather information
    document.querySelector("#city").innerHTML = data.name
    document.querySelector("#temp").innerHTML = Math.round(data.main.temp) + "°C"
    document.querySelector(".humidity").innerHTML = data.main.humidity + "%"
    document.querySelector(".wind").innerHTML = data.wind.speed + " km/h"

    // Step 5: Update additional weather metrics
    document.querySelector(".pressure").innerHTML = data.main.pressure + " hPa"
    document.querySelector(".visibility").innerHTML = Math.round(data.visibility / 1000) + " km"
    document.querySelector(".feels-like").innerHTML = Math.round(data.main.feels_like) + "°C"

    // Step 6: Map weather condition to icon and swap classes
    updateWeatherIcon(data.weather[0].icon)

    // Step 7: Update supplementary icons based on weather data
    updateSupplementaryIcons(data)
  } catch (error) {
    console.error("Error fetching weather data:", error)

    // Step 8: Handle errors gracefully with user feedback
    document.querySelector("#city").innerHTML = "City not found"
    document.querySelector("#temp").innerHTML = "--°C"
    document.querySelector(".humidity").innerHTML = "--%"
    document.querySelector(".wind").innerHTML = "--"
    document.querySelector(".pressure").innerHTML = "--"
    document.querySelector(".visibility").innerHTML = "--"
    document.querySelector(".feels-like").innerHTML = "--°C"

    // Set default sunny icon for error state
    updateWeatherIcon("01d")
  }
}

// Initialize app with default city on page load
document.addEventListener("DOMContentLoaded", () => {
  checkweather("tanger")
})
