import { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, CloudDrizzle, Search, MapPin, Droplets, Wind, Eye, Gauge } from 'lucide-react';

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
    <div style={styles.container}>
      <div style={styles.wrapper}>
        {/* Search Bar */}
        <div style={styles.searchBar}>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Enter city name"
            style={styles.input}
          />
          <button onClick={handleSearch} style={styles.button}>
            <Search size={20} />
            <span style={styles.buttonText}>Search</span>
          </button>
          {error && (
            <p style={styles.error}>{error}</p>
          )}
        </div>

        {loading ? (
          <div style={styles.loading}>Loading...</div>
        ) : weather ? (
          <>
            {/* Bento Grid Layout */}
            <div style={styles.bentoGrid}>
              {/* Time, Date & Location Box */}
              <div style={styles.timeBox}>
                <div style={styles.locationHeader}>
                  <MapPin size={20} />
                  <span style={styles.locationText}>{searchCity}, {weather.country}</span>
                </div>
                <div style={styles.time}>
                  {formatTime(currentTime)}
                </div>
                <div style={styles.date}>
                  {formatDate(currentTime)}
                </div>
              </div>

              {/* Current Weather Box */}
              <div style={styles.weatherBox}>
                <div style={styles.weatherHeader}>
                  <div>
                    <div style={styles.temperature}>
                      {weather.temp}°
                    </div>
                    <div style={styles.condition}>
                      {weather.description}
                    </div>
                    <div style={styles.feelsLike}>
                      Feels like {weather.feelsLike}°
                    </div>
                  </div>
                  <div style={styles.weatherIconLarge}>
                    {getWeatherIcon(weather.condition, 96)}
                  </div>
                </div>

                {/* Weather Details Grid */}
                <div style={styles.detailsGrid}>
                  <div style={styles.detailCard}>
                    <div style={styles.detailHeader}>
                      <Droplets size={20} />
                      <span style={styles.detailLabel}>Humidity</span>
                    </div>
                    <div style={styles.detailValue}>
                      {weather.humidity}%
                    </div>
                  </div>

                  <div style={styles.detailCard}>
                    <div style={styles.detailHeader}>
                      <Wind size={20} />
                      <span style={styles.detailLabel}>Wind Speed</span>
                    </div>
                    <div style={styles.detailValue}>
                      {weather.windSpeed} km/h
                    </div>
                  </div>

                  <div style={styles.detailCard}>
                    <div style={styles.detailHeader}>
                      <Gauge size={20} />
                      <span style={styles.detailLabel}>Pressure</span>
                    </div>
                    <div style={styles.detailValue}>
                      {weather.pressure} hPa
                    </div>
                  </div>

                  <div style={styles.detailCard}>
                    <div style={styles.detailHeader}>
                      <Eye size={20} />
                      <span style={styles.detailLabel}>Visibility</span>
                    </div>
                    <div style={styles.detailValue}>
                      {weather.visibility} km
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 6-Day Forecast */}
            <div style={styles.forecastGrid}>
              {forecast.map((day, idx) => (
                <div key={idx} style={styles.forecastCard}>
                  <div style={styles.forecastDay}>
                    {day.day}
                  </div>
                  <div style={styles.forecastIcon}>
                    {getWeatherIcon(day.icon, 48)}
                  </div>
                  <div style={styles.forecastTemp}>
                    {day.temp}°
                  </div>
                  <div style={styles.forecastDesc}>
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
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #67e8f9 0%, #a5f3fc 50%, #c4b5fd 100%)',
    padding: '24px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  wrapper: {
    maxWidth: '1400px',
    margin: '0 auto'
  },
  searchBar: {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    borderRadius: '24px',
    padding: '24px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    marginBottom: '24px',
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },
  input: {
    flex: '1',
    minWidth: '250px',
    padding: '12px 24px',
    borderRadius: '50px',
    border: '2px solid #e5e7eb',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.3s'
  },
  button: {
    padding: '12px 32px',
    background: '#c4b5fd',
    border: 'none',
    borderRadius: '50px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'background 0.3s',
    fontSize: '16px'
  },
  buttonText: {
    color: '#374151'
  },
  error: {
    color: '#ef4444',
    width: '100%',
    textAlign: 'center',
    marginTop: '8px'
  },
  loading: {
    textAlign: 'center',
    color: 'white',
    fontSize: '20px'
  },
  bentoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
    marginBottom: '24px'
  },
  timeBox: {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    borderRadius: '24px',
    padding: '32px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
  },
  locationHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#6b7280',
    marginBottom: '16px'
  },
  locationText: {
    fontWeight: '500'
  },
  time: {
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '8px'
  },
  date: {
    color: '#6b7280',
    fontSize: '16px'
  },
  weatherBox: {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    borderRadius: '24px',
    padding: '32px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    gridColumn: 'span 2'
  },
  weatherHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px'
  },
  temperature: {
    fontSize: '72px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '8px',
    lineHeight: '1'
  },
  condition: {
    fontSize: '20px',
    color: '#6b7280',
    textTransform: 'capitalize',
    marginBottom: '4px'
  },
  feelsLike: {
    color: '#9ca3af',
    fontSize: '14px'
  },
  weatherIconLarge: {
    display: 'flex'
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px'
  },
  detailCard: {
    background: 'linear-gradient(135deg, #ecfeff 0%, #faf5ff 100%)',
    borderRadius: '16px',
    padding: '16px'
  },
  detailHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#6b7280',
    marginBottom: '8px',
    fontSize: '14px'
  },
  detailLabel: {
    fontSize: '14px'
  },
  detailValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937'
  },
  forecastGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px'
  },
  forecastCard: {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    borderRadius: '24px',
    padding: '24px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    transition: 'transform 0.3s, box-shadow 0.3s',
    cursor: 'pointer'
  },
  forecastDay: {
    color: '#374151',
    fontWeight: 'bold',
    fontSize: '18px',
    marginBottom: '16px'
  },
  forecastIcon: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '16px'
  },
  forecastTemp: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '8px'
  },
  forecastDesc: {
    fontSize: '14px',
    color: '#6b7280',
    textTransform: 'capitalize'
  }
};

export default WeatherApp;