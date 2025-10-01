import { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, CloudDrizzle, Search, MapPin, Droplets, Wind, Eye, Gauge } from 'lucide-react';
import "./App.css";

const API_KEY = '7b6a6f9b787cac1ee11807f1b7294359'; // Replace with your OpenWeatherMap API key

function WeatherApp() {
  const [city, setCity] = useState('');
  const [searchCity, setSearchCity] = useState('London');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchWeather(searchCity);
  }, [searchCity]);

  const fetchWeather = async (cityName) => {
    setLoading(true);
    setError('');
    
    try {
      const currentResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`
      );
      
      if (!currentResponse.ok) {
        throw new Error('City not found');
      }
      
      const currentData = await currentResponse.json();
      
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric`
      );
      
      const forecastData = await forecastResponse.json();
      
      const dailyForecasts = [];
      const processedDays = new Set();
      
      forecastData.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dayKey = date.toDateString();
        
        if (!processedDays.has(dayKey) && dailyForecasts.length < 6) {
          processedDays.add(dayKey);
          dailyForecasts.push({
            day: date.toLocaleDateString('en-US', { weekday: 'short' }),
            temp: Math.round(item.main.temp),
            icon: item.weather[0].main.toLowerCase(),
            description: item.weather[0].description
          });
        }
      });
      
      setWeather({
        temp: Math.round(currentData.main.temp),
        feelsLike: Math.round(currentData.main.feels_like),
        condition: currentData.weather[0].main,
        description: currentData.weather[0].description,
        humidity: currentData.main.humidity,
        windSpeed: Math.round(currentData.wind.speed * 3.6),
        pressure: currentData.main.pressure,
        visibility: Math.round(currentData.visibility / 1000),
        country: currentData.sys.country
      });
      
      setForecast(dailyForecasts);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (city.trim()) {
      setSearchCity(city);
      setCity('');
    }
  };

  const getWeatherIcon = (condition, size = 48) => {
    const iconProps = { size, strokeWidth: 2 };
    switch(condition.toLowerCase()) {
      case 'rain':
      case 'drizzle':
        return <CloudRain {...iconProps} style={{ color: '#3b82f6' }} />;
      case 'clear':
        return <Sun {...iconProps} style={{ color: '#fbbf24' }} />;
      case 'clouds':
        return <Cloud {...iconProps} style={{ color: '#9ca3af' }} />;
      case 'snow':
        return <CloudDrizzle {...iconProps} style={{ color: '#bfdbfe' }} />;
      default:
        return <Sun {...iconProps} style={{ color: '#fbbf24' }} />;
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className='container'>
      <div className='wrapper'>
        {/* Search Bar */}
        <div className='searchBar'>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Enter city name"
            style={styles.input}
          />
          <button onClick={handleSearch} className='btn'>
            <Search size={20} />
            <span >Search</span>
          </button>
          {error && (
            <p className='error'>{error}</p>
          )}
        </div>

        {loading ? (
          <div className='loading'>Loading...</div>
        ) : weather ? (
          <>
            {/* Bento Grid Layout */}
            <div className='bento-grid'>
              {/* Time, Date & Location Box */}
              <div className='time-box'>
                <div className='location-header'>
                  <MapPin size={20} />
                  <span>{searchCity}, {weather.country}</span>
                </div>
                <div className='time'>
                  {formatTime(currentTime)}
                </div>
                <div className='date'>
                  {formatDate(currentTime)}
                </div>
              </div>

              {/* Current Weather Box */}
              <div className=' weather-box'>
                <div className='weather-header'>
                  <div>
                    <div className='temperature'>
                      {weather.temp}°
                    </div>
                    <div className='condition'>
                      {weather.description}
                    </div>
                    <div className='feelsLike'>
                      Feels like {weather.feelsLike}°
                    </div>
                  </div>
                  <div className='weather-icon-large'>
                    {getWeatherIcon(weather.condition, 96)}
                  </div>
                </div>

                {/* Weather Details Grid */}
                <div className='details-grid'>
                  <div className='detail-card'>
                    <div className='detail-header'>
                      <Droplets size={20} />
                      <span className='detail-label'>Humidity</span>
                    </div>
                    <div className='detail-value'>
                      {weather.humidity}%
                    </div>
                  </div>

                  <div className='detail-card'>
                    <div className='detail-header'>
                      <Wind size={20} />
                      <span className='detail-label'>Wind Speed</span>
                    </div>
                    <div style={styles.detailValue}>
                      {weather.windSpeed} km/h
                    </div>
                  </div>

                  <div className='detail-card'>
                    <div className='detail-header'>
                      <Gauge size={20} />
                      <span className='detail-label'>Pressure</span>
                    </div>
                    <div style={styles.detailValue}>
                      {weather.pressure} hPa
                    </div>
                  </div>

                  <div className='detail-card'>
                    <div className='detail-header'>
                      <Eye size={20} />
                      <span className='detail-label'>Visibility</span>
                    </div>
                    <div style={styles.detailValue}>
                      {weather.visibility} km
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 6-Day Forecast */}
            <div className='forecast-grid'>
              {forecast.map((day, idx) => (
                <div key={idx} className='forecast-card'>
                  <div className='forecast-day'>
                    {day.day}
                  </div>
                  <div className='forecast-icon'>
                    {getWeatherIcon(day.icon, 48)}
                  </div>
                  <div className='forecast-temp'>
                    {day.temp}°
                  </div>
                  <div className='forecastDesc'>
                    {day.description}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

const styles = {
  // weatherBox: {
  //   background: 'rgba(255, 255, 255, 0.9)',
  //   backdropFilter: 'blur(10px)',
  //   borderRadius: '24px',
  //   padding: '32px',
  //   boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  //   gridColumn: 'span 2'
  // },
  // weatherHeader: {
  //   display: 'flex',
  //   justifyContent: 'space-between',
  //   alignItems: 'flex-start',
  //   marginBottom: '24px'
  // },
  // temperature: {
  //   fontSize: '72px',
  //   fontWeight: 'bold',
  //   color: '#1f2937',
  //   marginBottom: '8px',
  //   lineHeight: '1'
  // },
  // condition: {
  //   fontSize: '20px',
  //   color: '#6b7280',
  //   textTransform: 'capitalize',
  //   marginBottom: '4px'
  // },
  // feelsLike: {
  //   color: '#9ca3af',
  //   fontSize: '14px'
  // },
  // weatherIconLarge: {
  //   display: 'flex'
  // },
  // detailsGrid: {
  //   display: 'grid',
  //   gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  //   gap: '16px'
  // },
  // detailCard: {
  //   background: 'linear-gradient(135deg, #ecfeff 0%, #faf5ff 100%)',
  //   borderRadius: '16px',
  //   padding: '16px'
  // },
  // detailHeader: {
  //   display: 'flex',
  //   alignItems: 'center',
  //   gap: '8px',
  //   color: '#6b7280',
  //   marginBottom: '8px',
  //   fontSize: '14px'
  // },
  // detailLabel: {
  //   fontSize: '14px'
  // },
  // detailValue: {
  //   fontSize: '24px',
  //   fontWeight: 'bold',
  //   color: '#1f2937'
  // },
  // forecastGrid: {
  //   display: 'grid',
  //   gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  //   gap: '16px'
  // },
  // forecastCard: {
  //   background: 'rgba(255, 255, 255, 0.9)',
  //   backdropFilter: 'blur(10px)',
  //   borderRadius: '24px',
  //   padding: '24px',
  //   boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  //   textAlign: 'center',
  //   transition: 'transform 0.3s, box-shadow 0.3s',
  //   cursor: 'pointer'
  // },
  // forecastDay: {
  //   color: '#374151',
  //   fontWeight: 'bold',
  //   fontSize: '18px',
  //   marginBottom: '16px'
  // },
  // forecastIcon: {
  //   display: 'flex',
  //   justifyContent: 'center',
  //   marginBottom: '16px'
  // },
  // forecastTemp: {
  //   fontSize: '32px',
  //   fontWeight: 'bold',
  //   color: '#1f2937',
  //   marginBottom: '8px'
  // },
  // forecastDesc: {
  //   fontSize: '14px',
  //   color: '#6b7280',
  //   textTransform: 'capitalize'
  // }
};

export default WeatherApp;