import * as Location from 'expo-location';

export interface WeatherData {
  condition: 'sunny' | 'cloudy' | 'rainy' | 'clear' | 'partly-cloudy' | 'thunderstorm' | 'snow';
  temperature: number;
  description: string;
  advice: string;
  humidity: number;
  windSpeed: number;
  location?: string;
}

const WEATHER_API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY || '';
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';

/**
 * Map OpenWeatherMap condition codes to our simplified conditions
 */
const mapWeatherCondition = (code: number): WeatherData['condition'] => {
  // OpenWeatherMap weather condition codes
  // 2xx = Thunderstorm
  // 3xx = Drizzle
  // 5xx = Rain
  // 6xx = Snow
  // 7xx = Atmosphere (fog, mist, etc.)
  // 800 = Clear
  // 80x = Clouds
  
  if (code >= 200 && code < 300) return 'thunderstorm';
  if (code >= 300 && code < 600) return 'rainy';
  if (code >= 600 && code < 700) return 'snow';
  if (code === 800) return 'clear';
  if (code === 801 || code === 802) return 'partly-cloudy';
  if (code > 802) return 'cloudy';
  
  return 'sunny';
};

/**
 * Generate gardening advice based on weather conditions
 */
const getGardeningAdvice = (condition: WeatherData['condition'], temp: number, humidity: number): string => {
  if (condition === 'rainy') {
    return 'Skip watering today! Natural rainfall will nourish your plants.';
  }
  if (condition === 'thunderstorm') {
    return 'Stay safe indoors. Check your plants for damage after the storm passes.';
  }
  if (condition === 'sunny' && temp > 30) {
    return 'Hot day ahead! Water early morning or evening to prevent evaporation.';
  }
  if (condition === 'sunny' || condition === 'clear') {
    return 'Perfect weather for gardening! Your plants will thrive today.';
  }
  if (condition === 'cloudy' && humidity > 70) {
    return 'High humidity - watch for fungal issues on leaves.';
  }
  if (condition === 'snow') {
    return 'Protect sensitive plants from frost. Consider indoor gardening activities.';
  }
  return 'Good conditions for garden maintenance and planning.';
};

/**
 * Get user's current location
 */
const getUserLocation = async (): Promise<Location.LocationObject | null> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Location permission denied');
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return location;
  } catch (error) {
    console.error('Error getting location:', error);
    return null;
  }
};

/**
 * Fetch weather data from OpenWeatherMap API
 */
export const fetchWeatherData = async (): Promise<WeatherData> => {
  try {
    // Check if API key is configured
    if (!WEATHER_API_KEY) {
      console.log('Weather API key not configured. Using default sunny weather.');
      return getDefaultWeatherData();
    }

    // Get user's location
    const location = await getUserLocation();
    if (!location) {
      console.log('Could not get location. Using default sunny weather.');
      return getDefaultWeatherData();
    }

    // Fetch weather data from OpenWeatherMap
    const { latitude, longitude } = location.coords;
    const url = `${WEATHER_API_URL}?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();

    // Parse the OpenWeatherMap response
    const condition = mapWeatherCondition(data.weather[0].id);
    const temperature = Math.round(data.main.temp);
    const humidity = data.main.humidity;
    const windSpeed = Math.round(data.wind.speed * 3.6); // Convert m/s to km/h
    const description = data.weather[0].main;
    const locationName = data.name;

    return {
      condition,
      temperature,
      description,
      advice: getGardeningAdvice(condition, temperature, humidity),
      humidity,
      windSpeed,
      location: locationName,
    };
  } catch (error) {
    console.log('Using default sunny weather data:', error);
    return getDefaultWeatherData();
  }
};

/**
 * Get default/fallback weather data
 */
const getDefaultWeatherData = (): WeatherData => ({
  condition: 'sunny',
  temperature: 27,
  description: 'Perfect Day',
  advice: 'Ideal weather for gardening! Your plants will thrive today.',
  humidity: 65,
  windSpeed: 8,
});

/**
 * Cache weather data to avoid excessive API calls
 */
let cachedWeather: WeatherData | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export const getWeatherData = async (forceRefresh = false): Promise<WeatherData> => {
  const now = Date.now();
  
  // Return cached data if it's still valid and not forcing refresh
  if (!forceRefresh && cachedWeather && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedWeather;
  }

  // Fetch fresh data
  cachedWeather = await fetchWeatherData();
  lastFetchTime = now;
  
  return cachedWeather;
};
