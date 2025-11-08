# Weather Feature Setup Guide

The app now includes real-time weather data using the OpenWeatherMap API!

## Features

- 🌤️ **Real-time weather data** based on your location
- 🌡️ **Temperature, humidity, and wind speed**
- 🌱 **Smart gardening advice** based on current conditions
- 📍 **Location-based forecasts**
- 💾 **Automatic caching** (refreshes every 30 minutes)
- 🔄 **Pull to refresh** for instant updates

## Setup Instructions

### 1. Install Required Dependency

Run the following command to install `expo-location`:

```powershell
npm install expo-location
```

Or with yarn:
```powershell
yarn add expo-location
```

### 2. Get a Free OpenWeatherMap API Key

1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Click "Sign Up" in the top right
3. Create a free account
4. After signing in, go to "API keys" in your account menu
5. Copy your API key (or generate a new one)
   - **Note:** It may take a few minutes for new API keys to activate

### 3. Add API Key to Your Environment

Add your API key to the `.env` file:

```env
EXPO_PUBLIC_OPENWEATHER_API_KEY=your-actual-api-key-here
```

**Example:**
```env
EXPO_PUBLIC_OPENWEATHER_API_KEY=abc123def456ghi789jkl012mno345pq
```

### 4. Configure Location Permissions

#### For Android (app.json)

The location permission is already configured in your `app.json`. Make sure these are present:

```json
{
  "expo": {
    "android": {
      "permissions": [
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION"
      ]
    }
  }
}
```

#### For iOS (app.json)

Add location permission descriptions:

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "This app needs access to your location to show local weather conditions for your garden."
      }
    }
  }
}
```

### 5. Restart Your Development Server

After adding the API key and installing the package:

```powershell
# Stop the current server (Ctrl+C)
# Then restart
npm start
```

For development builds, you may need to rebuild:

```powershell
npx expo prebuild --clean
npx expo run:android
```

## How It Works

1. **First Load**: App requests location permission from user
2. **Location Access**: Gets user's current GPS coordinates
3. **Weather Fetch**: Calls OpenWeatherMap API with coordinates
4. **Smart Caching**: Stores weather data for 30 minutes to minimize API calls
5. **Gardening Advice**: Analyzes weather conditions and provides relevant gardening tips

## Weather Conditions Supported

- ☀️ Clear/Sunny
- ⛅ Partly Cloudy
- ☁️ Cloudy
- 🌧️ Rainy
- ⛈️ Thunderstorm
- ❄️ Snow

Each condition includes:
- Current temperature (°C)
- Humidity percentage
- Wind speed (km/h)
- Location name
- Customized gardening advice

## API Usage Limits

**Free Tier:**
- 1,000 API calls per day
- 60 calls per minute

With the 30-minute cache, typical usage is:
- ~48 calls per day (if app is constantly open)
- Much less with normal usage

## Troubleshooting

### Weather Not Loading

1. **Check API Key**: Make sure it's added to `.env` without quotes
2. **Check Internet**: Ensure device has internet connection
3. **Wait for Activation**: New API keys take 10-15 minutes to activate
4. **Check Console**: Look for weather-related error messages

### Location Permission Denied

- The app will fall back to default weather data
- User can grant permission in device settings
- On Android: Settings > Apps > Garden Tracker > Permissions > Location

### Falls Back to Default Weather

If any error occurs (no API key, no location, API error), the app shows sensible default weather data so the UI never breaks.

## Privacy Note

- Location is only used to fetch weather data
- Location is NOT stored or transmitted anywhere else
- No location tracking occurs
- Users can deny location permission and app will still work

## Cost

**100% FREE** with OpenWeatherMap's free tier, which is more than sufficient for personal use.

---

Enjoy accurate weather-based gardening advice! 🌱☀️
