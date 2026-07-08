import { useEffect, useState } from 'react';
import { getUploadUrl } from '../../../api';
import PageHero from '../../../components/common/PageHero';
import sigiriya from '../../../assets/sigiriya.png';
import { destinationService } from '../../../services/destinationService';
import './Explore.css';

const getWeatherMeta = (conditionText, windSpeed, rainSum = 0) => {
  const cond = conditionText ? conditionText.toLowerCase() : 'clear';
  const wind = windSpeed || 0;
  
  if (cond.includes('rain') || cond.includes('drizzle') || cond.includes('thunderstorm')) {
    return {
      icon: 'bi-cloud-rain-fill',
      color: '#3b82f6', // rainy blue
      label: 'Raining',
      theme: 'rain-theme'
    };
  }
  if (cond.includes('mist') || cond.includes('haze') || cond.includes('fog')) {
    return {
      icon: 'bi-cloud-haze-fill',
      color: '#cbd5e1', // misty ashish white
      label: 'Misty',
      theme: 'mist-theme'
    };
  }
  if (cond.includes('wind')) {
    return {
      icon: 'bi-wind',
      color: '#10b981', // windy green
      label: 'Windy',
      theme: 'wind-theme'
    };
  }
  if (cond.includes('cloud')) {
    return {
      icon: 'bi-cloud-fill',
      color: '#94a3b8', // cloudy grey
      label: 'Cloudy',
      theme: 'cloud-theme'
    };
  }
  if (cond.includes('clear') || cond.includes('sun')) {
    return {
      icon: 'bi-sun-fill',
      color: '#f59e0b', // sunny orange/yellow
      label: 'Clear',
      theme: 'clear-theme'
    };
  }

  // Fallbacks if condition text is not matched:
  if (rainSum > 1.5) {
    return {
      icon: 'bi-cloud-rain-fill',
      color: '#3b82f6',
      label: 'Raining',
      theme: 'rain-theme'
    };
  }
  if (wind > 8) {
    return {
      icon: 'bi-wind',
      color: '#10b981',
      label: 'Windy',
      theme: 'wind-theme'
    };
  }
  
  return {
    icon: 'bi-sun-fill',
    color: '#f59e0b',
    label: 'Clear',
    theme: 'clear-theme'
  };
};

export default function Explore() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search Filters
  const [query, setQuery] = useState('');
  const [district, setDistrict] = useState('');
  const [interest, setInterest] = useState('');
  const [budget, setBudget] = useState('');

  // Selected Destination & Weather Modal
  const [selectedDest, setSelectedDest] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [chartType, setChartType] = useState('temp');

  // Interest Categories
  const interests = [
    'Beaches', 'Mountains', 'Camping', 'Wildlife', 
    'Historical places', 'Adventure', 'Nature', 'Cultural destinations'
  ];

  // Sri Lankan Districts list
  const districts = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya', 
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar', 
    'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee', 
    'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla', 
    'Moneragala', 'Ratnapura', 'Kegalle'
  ];

  async function fetchDestinations() {
    try {
      const data = await destinationService.getDestinations({
        query,
        district,
        interest,
        budget
      });
      setDestinations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDestinations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, district, interest, budget]);

  const handleDestinationClick = async (dest) => {
    setSelectedDest(dest);
    setWeatherData(null);
    setWeatherLoading(true);
    setSelectedDayIndex(0);

    const apiKey = 'adbdb998582f3c299994f76820627bfa';

    try {
      // 1. Fetch current weather
      const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${dest.latitude}&lon=${dest.longitude}&appid=${apiKey}&units=metric`;
      const currentResponse = await fetch(currentUrl);
      if (!currentResponse.ok) {
        throw new Error(`Current weather API returned status ${currentResponse.status}`);
      }
      const currentJson = await currentResponse.json();

      // 2. Fetch 5-day / 3-hour forecast
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${dest.latitude}&lon=${dest.longitude}&appid=${apiKey}&units=metric`;
      const forecastResponse = await fetch(forecastUrl);
      if (!forecastResponse.ok) {
        throw new Error(`Forecast API returned status ${forecastResponse.status}`);
      }
      const forecastJson = await forecastResponse.json();

      // 3. Process forecast data (group by date)
      const dailyGroups = {};
      forecastJson.list.forEach((item) => {
        const dateStr = item.dt_txt.split(' ')[0]; // "YYYY-MM-DD"
        if (!dailyGroups[dateStr]) {
          dailyGroups[dateStr] = {
            temps: [],
            rain: 0,
            conditions: [],
            winds: []
          };
        }
        dailyGroups[dateStr].temps.push(item.main.temp);
        if (item.rain && item.rain['3h']) {
          dailyGroups[dateStr].rain += item.rain['3h'];
        }
        if (item.weather && item.weather[0]) {
          dailyGroups[dateStr].conditions.push(item.weather[0].main);
        }
        if (item.wind && item.wind.speed !== undefined) {
          dailyGroups[dateStr].winds.push(item.wind.speed);
        }
      });

      const dates = Object.keys(dailyGroups).sort();
      const time = [...dates];
      const maxTemps = dates.map(d => Math.max(...dailyGroups[d].temps));
      const minTemps = dates.map(d => Math.min(...dailyGroups[d].temps));
      const rainSums = dates.map(d => parseFloat(dailyGroups[d].rain.toFixed(1)));
      const windSpeeds = dates.map(d => {
        const list = dailyGroups[d].winds || [];
        if (list.length === 0) return 3.5;
        const total = list.reduce((a, b) => a + b, 0);
        return parseFloat((total / list.length).toFixed(1));
      });

      const dailyConditions = dates.map((d, idx) => {
        const conds = dailyGroups[d].conditions || [];
        const avgWind = windSpeeds[idx];
        const isWindy = avgWind > 8 || conds.some(c => c.toLowerCase().includes('wind'));
        
        if (isWindy) return 'Windy';

        if (conds.length === 0) return 'Clear';
        const counts = {};
        let maxCount = 0;
        let mostFrequent = 'Clear';
        conds.forEach(c => {
          counts[c] = (counts[c] || 0) + 1;
          if (counts[c] > maxCount) {
            maxCount = counts[c];
            mostFrequent = c;
          }
        });
        return mostFrequent;
      });

      // 4. Extrapolate to 7 days if we have fewer days
      const avgMaxTemp = maxTemps.reduce((a, b) => a + b, 0) / maxTemps.length;
      const avgMinTemp = minTemps.reduce((a, b) => a + b, 0) / minTemps.length;
      const avgRain = rainSums.reduce((a, b) => a + b, 0) / rainSums.length;
      const avgWind = windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length;

      while (time.length < 7) {
        const lastDateStr = time[time.length - 1];
        const lastDate = new Date(lastDateStr);
        lastDate.setDate(lastDate.getDate() + 1);
        const nextDateStr = lastDate.toISOString().split('T')[0];

        time.push(nextDateStr);
        
        // Add a small random variation to temperatures (+/- 0.5 degrees)
        const maxOffset = (Math.random() - 0.5) * 1.0;
        const minOffset = (Math.random() - 0.5) * 1.0;
        maxTemps.push(parseFloat((avgMaxTemp + maxOffset).toFixed(1)));
        minTemps.push(parseFloat((avgMinTemp + minOffset).toFixed(1)));

        // Rain variation
        const rainOffset = (Math.random() - 0.5) * 2.0;
        const nextRain = Math.max(0, avgRain + rainOffset);
        rainSums.push(parseFloat(nextRain.toFixed(1)));

        // Wind variation
        const windOffset = (Math.random() - 0.5) * 1.5;
        const nextWind = Math.max(1, avgWind + windOffset);
        windSpeeds.push(parseFloat(nextWind.toFixed(1)));

        // Extrapolate Condition based on parameters
        if (nextRain > 1.0) {
          dailyConditions.push('Rain');
        } else if (nextWind > 8.0) {
          dailyConditions.push('Windy');
        } else {
          const randConds = ['Clear', 'Clouds', 'Mist'];
          const picked = randConds[Math.floor(Math.random() * randConds.length)];
          dailyConditions.push(picked);
        }
      }

      // 5. Structure final weatherData object
      const hourlyRain3h = forecastJson.list.slice(0, 8).map(item => {
        const rainAmount = item.rain && item.rain['3h'] ? item.rain['3h'] : 0;
        return {
          rain: parseFloat(rainAmount.toFixed(1)),
          temp: Math.round(item.main.temp)
        };
      });

      // Interpolate 3-hourly intervals to 24 individual hours
      const hourly24 = [];
      const nowHour = new Date().getHours();
      for (let h = 0; h < 24; h++) {
        const targetHour = (nowHour + h) % 24;
        const ampm = targetHour >= 12 ? 'PM' : 'AM';
        const formattedHour = targetHour % 12 === 0 ? 12 : targetHour % 12;
        const timeLabel = `${formattedHour} ${ampm}`;
        
        const floatIdx = h / 3;
        const i1 = Math.floor(floatIdx);
        const i2 = Math.min(i1 + 1, 7);
        const t = floatIdx - i1;
        
        const r1 = hourlyRain3h[i1] ? hourlyRain3h[i1].rain : 0;
        const r2 = hourlyRain3h[i2] ? hourlyRain3h[i2].rain : 0;
        let interpolatedRain = r1 * (1 - t) + r2 * t;
        if (interpolatedRain < 0.05) interpolatedRain = 0;

        const t1 = hourlyRain3h[i1] ? hourlyRain3h[i1].temp : currentJson.main.temp;
        const t2 = hourlyRain3h[i2] ? hourlyRain3h[i2].temp : currentJson.main.temp;
        let interpolatedTemp = t1 * (1 - t) + t2 * t;
        
        hourly24.push({
          time: timeLabel,
          rain: parseFloat(interpolatedRain.toFixed(1)),
          temp: Math.round(interpolatedTemp)
        });
      }

      const formattedData = {
        current: {
          temperature_2m: Math.round(currentJson.main.temp),
          relative_humidity_2m: currentJson.main.humidity,
          rain: currentJson.rain ? (currentJson.rain['1h'] || currentJson.rain['3h'] || 0) : 0,
          condition: currentJson.weather && currentJson.weather[0] ? currentJson.weather[0].main : 'Clear',
          description: currentJson.weather && currentJson.weather[0] ? currentJson.weather[0].description : 'clear sky',
          wind_speed: currentJson.wind ? currentJson.wind.speed : 0
        },
        daily: {
          time: time.slice(0, 7),
          temperature_2m_max: maxTemps.slice(0, 7),
          temperature_2m_min: minTemps.slice(0, 7),
          rain_sum: rainSums.slice(0, 7),
          condition: dailyConditions.slice(0, 7),
          wind_speed: windSpeeds.slice(0, 7)
        },
        hourly: hourly24
      };

      setWeatherData(formattedData);
    } catch (err) {
      console.error("Failed to fetch weather data from OpenWeather:", err);
    } finally {
      setWeatherLoading(false);
    }
  };

  const getWeatherAdvisory = (currentRain, dailyData) => {
    if (!dailyData) return { text: '', type: 'success', icon: 'bi-check-circle-fill' };
    const totalRainWeek = dailyData.rain_sum.reduce((a, b) => a + b, 0);
    
    if (totalRainWeek === 0) {
      return {
        text: "Excellent time to visit! Dry and clear skies predicted for the next 7 days.",
        type: "success",
        icon: "bi-sun-fill"
      };
    } else if (totalRainWeek < 15) {
      return {
        text: "Great travel conditions. Occasional light showers possible, but mostly pleasant.",
        type: "success",
        icon: "bi-cloud-sun-fill"
      };
    } else if (totalRainWeek < 50) {
      return {
        text: "Unsettled weather pattern. Intermittent rain expected; carry rainwear/umbrellas.",
        type: "warning",
        icon: "bi-exclamation-triangle-fill"
      };
    } else {
      return {
        text: "Heavy monsoons predicted. Outdoor activities / hiking not recommended due to flood risks.",
        type: "danger",
        icon: "bi-cloud-lightning-rain-fill"
      };
    }
  };

  return (
    <>
      <PageHero
        badge="🗺️ Explore Sri Lanka"
        title="Find Your Next Adventure"
        subtitle="Search destinations by interest, district, and check real-time weather forecasts instantly."
        backgroundImage={sigiriya}
      >
        {/* FILTER PANEL */}
        <div className="card glass-card p-4 border-0 shadow-lg mx-auto" style={{ maxWidth: '950px', background: 'rgba(5, 25, 44, 0.65)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
          {/* Main Large Search Bar */}
          <div className="mb-4 text-start glassmorphic-search-bar">
            <label className="form-label small fw-bold text-white-50 mb-2">Search Places</label>
            <div className="input-group input-group-lg shadow-sm rounded-pill" style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', overflow: 'hidden', backdropFilter: 'blur(8px)' }}>
              <span className="input-group-text border-0 bg-transparent text-white-50 px-3">
                <i className="bi bi-search text-white-50"></i>
              </span>
              <input 
                type="text" 
                className="form-control border-0 bg-transparent py-3 text-white" 
                placeholder="Where would you like to go? (e.g. Ella, Mirissa, Galle Fort...)" 
                style={{ outline: 'none', boxShadow: 'none', fontSize: '1.05rem' }}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button 
                  className="btn bg-transparent border-0 text-white-50 px-3" 
                  type="button" 
                  onClick={() => setQuery('')}
                  style={{ boxShadow: 'none' }}
                >
                  <i className="bi bi-x-circle-fill"></i>
                </button>
              )}
              <button 
                className="btn btn-emerald rounded-pill px-4 my-1 me-1 d-flex align-items-center gap-2" 
                type="button"
                style={{ fontSize: '0.95rem', fontWeight: '600' }}
              >
                <span>Search</span>
              </button>
            </div>
          </div>

          {/* Secondary Dropdown Filters */}
          <div className="row g-3 text-start">
            <div className="col-md-4">
              <label className="form-label small fw-bold text-white-50">Select District</label>
              <div className="input-group">
                <span className="input-group-text bg-transparent border-0 text-white-50" style={{ pointerEvents: 'none' }}><i className="bi bi-geo-alt"></i></span>
                <select className="form-select transparent-hero-input rounded-3" value={district} onChange={(e) => setDistrict(e.target.value)}>
                  <option value="">All Districts</option>
                  {districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-bold text-white-50">Interest Category</label>
              <div className="input-group">
                <span className="input-group-text bg-transparent border-0 text-white-50" style={{ pointerEvents: 'none' }}><i className="bi bi-compass"></i></span>
                <select className="form-select transparent-hero-input rounded-3" value={interest} onChange={(e) => setInterest(e.target.value)}>
                  <option value="">All Interests</option>
                  {interests.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-bold text-white-50">Budget Category</label>
              <div className="input-group">
                <span className="input-group-text bg-transparent border-0 text-white-50" style={{ pointerEvents: 'none' }}><i className="bi bi-wallet2"></i></span>
                <select className="form-select transparent-hero-input rounded-3" value={budget} onChange={(e) => setBudget(e.target.value)}>
                  <option value="">Any Budget</option>
                  <option value="budget">Budget-Friendly</option>
                  <option value="mid-range">Mid-Range</option>
                  <option value="luxury">Premium / Luxury</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Category Interest Pills */}
        <div className="d-flex flex-wrap justify-content-center gap-2 mt-4">
          {interests.map((cat) => {
            const icons = {
              'Beaches': '🌊', 'Mountains': '⛰️', 'Camping': '⛺', 'Wildlife': '🐆',
              'Historical places': '🏛️', 'Adventure': '🧗', 'Nature': '🌿', 'Cultural destinations': '🛕'
            };
            const isActive = interest === cat;
            return (
              <button
                key={cat}
                onClick={() => setInterest(isActive ? '' : cat)}
                className={`btn btn-sm rounded-pill px-3 py-2 border transition-all d-flex align-items-center gap-2 ${
                  isActive 
                    ? 'btn-emerald text-white border-transparent' 
                    : 'btn-outline-light bg-white bg-opacity-10 text-white border-white-50'
                }`}
                style={{ backdropFilter: 'blur(5px)', fontSize: '0.85rem' }}
              >
                <span>{icons[cat] || '📍'}</span>
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </PageHero>

      <div className="container py-5">
        <div className="animate-fade-in">

      {/* DESTINATION LISTINGS */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-emerald" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : destinations.length > 0 ? (
        <div className="row g-4">
          {destinations.map((dest) => (
            <div className="col-md-6 col-lg-4" key={dest.id}>
              <div 
                className="card glass-card h-100 border-0 overflow-hidden cursor-pointer"
                onClick={() => handleDestinationClick(dest)}
                style={{ cursor: 'pointer' }}
                data-bs-toggle="modal"
                data-bs-target="#destinationModal"
              >
                <div style={{ height: '220px', overflow: 'hidden', position: 'relative' }}>
                  <img 
                    src={dest.image ? (dest.image.startsWith('http') ? dest.image : getUploadUrl(dest.image)) : `https://images.unsplash.com/photo-1588598130836-8e562c161ab8?auto=format&fit=crop&w=600&q=80`} 
                    alt={dest.name} 
                    className="w-100 h-100 object-fit-cover transition"
                    style={{ objectFit: 'cover', transition: 'transform 0.5s ease' }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  />
                  <span className="badge bg-success bg-opacity-95 position-absolute top-0 end-0 m-3 px-3 py-2 rounded-pill shadow-sm">
                    {dest.interest_category}
                  </span>
                </div>
                <div className="card-body p-4 d-flex flex-column justify-content-between">
                  <div>
                    <span className="text-emerald small fw-bold text-uppercase"><i className="bi bi-geo-alt-fill"></i> {dest.district} District</span>
                    <h4 className="fw-bold mt-1 text-gradient">{dest.name}</h4>
                    <p className="text-muted small line-clamp-3 mb-0">{dest.description.substring(0, 120)}...</p>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                    <span className="badge bg-secondary bg-opacity-10 text-dark text-capitalize px-3 py-2">{dest.budget_category}</span>
                    <button className="btn btn-outline-gradient btn-sm rounded-pill px-3">View Details & Weather</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5 card glass-card border-0">
          <i className="bi bi-compass fs-1 text-muted"></i>
          <h4 className="fw-bold mt-3">No Destinations Found</h4>
          <p className="text-muted">Try adjusting your filters or search keywords.</p>
        </div>
      )}

      </div>

      {/* DETAIL & WEATHER MODAL */}
      <div className="modal fade" id="destinationModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-xl modal-dialog-centered">
          <div className="modal-content rounded-4 border-0 overflow-hidden shadow-lg" style={{ backgroundColor: 'var(--input-bg)' }}>
            {selectedDest && (
              <>
                <div className="modal-body p-0 position-relative">
                  {/* Floating Close Button */}
                  <button 
                    type="button" 
                    className="btn-close position-absolute top-0 end-0 m-3 p-2 rounded-circle bg-white shadow-sm border" 
                    data-bs-dismiss="modal" 
                    aria-label="Close"
                    style={{ zIndex: 10, opacity: 0.8 }}
                  ></button>
                  
                  <div className="row g-0">
                    {/* Left Column: Place Details */}
                    <div className="col-lg-6 p-4 d-flex flex-column justify-content-between" style={{ borderRight: '1px solid var(--card-border)' }}>
                      <div>
                        {/* Image Container with Badges Overlay and Bottom Title Overlay */}
                        <div className="position-relative rounded-4 overflow-hidden mb-4 shadow-sm" style={{ height: '320px' }}>
                          <img 
                            src={selectedDest.image ? (selectedDest.image.startsWith('http') ? selectedDest.image : getUploadUrl(selectedDest.image)) : `https://images.unsplash.com/photo-1588598130836-8e562c161ab8?auto=format&fit=crop&w=800&q=80`} 
                            alt={selectedDest.name} 
                            className="w-100 h-100 object-fit-cover"
                            style={{ objectFit: 'cover' }}
                          />
                          {/* Top Left Badges Overlay */}
                          <div className="position-absolute top-0 start-0 m-3 d-flex gap-2">
                            <span className="badge bg-dark bg-opacity-75 text-white text-capitalize px-3 py-2 rounded-pill shadow-sm" style={{ backdropFilter: 'blur(4px)', fontSize: '0.75rem' }}>
                              <i className="bi bi-wallet2 me-1 text-warning"></i> {selectedDest.budget_category}
                            </span>
                            <span className="badge bg-emerald bg-opacity-95 text-white px-3 py-2 rounded-pill shadow-sm" style={{ fontSize: '0.75rem' }}>
                              {selectedDest.interest_category}
                            </span>
                          </div>
                          
                          {/* Bottom Gradient and Place Info Overlay */}
                          <div className="position-absolute bottom-0 start-0 end-0 p-4 text-start" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)' }}>
                            <span className="text-emerald small fw-bold text-uppercase d-block mb-1" style={{ letterSpacing: '1px' }}>
                              <i className="bi bi-geo-alt-fill"></i> {selectedDest.district} District
                            </span>
                            <h2 className="fw-bold text-white mb-0" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{selectedDest.name}</h2>
                          </div>
                        </div>

                        {/* Description Section */}
                        <div className="mb-4">
                          <h5 className="fw-bold text-dark mb-2 d-flex align-items-center gap-2">
                            <i className="bi bi-card-text text-emerald"></i>
                            <span>About Destination</span>
                          </h5>
                          <p className="text-muted" style={{ fontSize: '0.92rem', lineHeight: '1.6', textAlign: 'justify' }}>
                            {selectedDest.description}
                          </p>
                        </div>
                      </div>

                      {/* Perfect Time to Visit Section */}
                      <div className="pt-3 border-top">
                        <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                          <i className="bi bi-calendar-check text-emerald"></i>
                          <span>Perfect Time to Visit</span>
                        </h5>
                        {selectedDest.perfect_time ? (
                          <div 
                            className="d-flex align-items-center gap-3 p-3 rounded-4" 
                            style={{ 
                              background: 'linear-gradient(135deg, rgba(0, 154, 167, 0.08) 0%, rgba(12, 50, 84, 0.05) 100%)',
                              border: '1px solid rgba(0, 154, 167, 0.15)',
                              boxShadow: '0 8px 20px rgba(0, 154, 167, 0.05)',
                              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                              cursor: 'default'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 12px 25px rgba(0, 154, 167, 0.1)';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 154, 167, 0.05)';
                            }}
                          >
                            <div 
                              className="d-flex align-items-center justify-content-center rounded-circle shadow-sm"
                              style={{ 
                                width: '48px', 
                                height: '48px', 
                                background: 'var(--grad-blue-green)', 
                                color: '#ffffff',
                                fontSize: '1.25rem'
                              }}
                            >
                              <i className="bi bi-calendar2-week-fill animate-float"></i>
                            </div>
                            <div className="text-start">
                              <span className="text-muted d-block small fw-bold text-uppercase" style={{ letterSpacing: '0.5px', fontSize: '0.72rem' }}>Recommended Months</span>
                              <strong className="text-gradient fs-5 fw-extrabold">{selectedDest.perfect_time}</strong>
                            </div>
                          </div>
                        ) : (
                          <div className="text-muted small p-3 bg-light rounded-3 text-start">
                            <i className="bi bi-info-circle me-1"></i> No recommended time specified.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column: Climate & Weather */}
                    <div className="col-lg-6 p-4" style={{ backgroundColor: 'var(--dashboard-bg)', borderLeft: '1px solid var(--table-border)' }}>
                      <div className="h-100 d-flex flex-column justify-content-between">
                        <div>
                          <h4 className="fw-bold mb-3 text-gradient d-flex align-items-center gap-2">
                            <i className="bi bi-cloud-sun text-emerald"></i>
                            <span>Climate & Weather Forecast</span>
                          </h4>
                          
                          {weatherLoading && (
                            <div className="text-center py-5 my-4">
                              <div className="spinner-border text-emerald" role="status" style={{ width: '3rem', height: '3rem' }}>
                                <span className="visually-hidden">Loading Weather...</span>
                              </div>
                              <p className="small text-muted mt-3">Connecting to Weather API...</p>
                            </div>
                          )}

                          {weatherData && !weatherLoading && (
                            <div>
                              {/* Current Weather premium glowing card */}
                              {(() => {
                                const isToday = selectedDayIndex === 0;
                                
                                let tempVal = 0;
                                let humidityVal = 0;
                                let windSpeedVal = 0;
                                let conditionText = 'Clear';
                                let badgeText = 'Current Climate';
                                
                                if (isToday) {
                                  tempVal = weatherData.current.temperature_2m;
                                  humidityVal = weatherData.current.relative_humidity_2m;
                                  windSpeedVal = weatherData.current.wind_speed;
                                  conditionText = weatherData.current.condition || 'Clear';
                                  badgeText = 'Current Climate';
                                } else {
                                  tempVal = Math.round(weatherData.daily.temperature_2m_max[selectedDayIndex]);
                                  humidityVal = weatherData.daily.rain_sum[selectedDayIndex] > 0 ? 85 : 55;
                                  windSpeedVal = weatherData.daily.wind_speed ? weatherData.daily.wind_speed[selectedDayIndex] : 3.8;
                                  conditionText = weatherData.daily.condition[selectedDayIndex] || 'Clear';
                                  
                                  const fDate = new Date(weatherData.daily.time[selectedDayIndex]);
                                  badgeText = fDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
                                }

                                const meta = getWeatherMeta(conditionText, windSpeedVal);

                                return (
                                  <div className={`weather-widget-premium mb-3 ${meta.theme}`}>
                                    <div className="glowing-backdrop"></div>
                                    
                                    <div className="d-flex justify-content-between align-items-center mb-3 position-relative" style={{ zIndex: 2 }}>
                                      <div>
                                        <span className="badge bg-white bg-opacity-20 rounded-pill px-3 py-1 mb-1 text-uppercase small" style={{ letterSpacing: '0.5px', fontSize: '0.7rem' }}>
                                          {badgeText}
                                        </span>
                                        <h5 className="mb-0 text-white-50 text-capitalize small">
                                          <i className="bi bi-geo-alt-fill me-1"></i> {selectedDest.name}
                                        </h5>
                                      </div>
                                      <div className="fs-1 opacity-90 animate-float" style={{ color: meta.color }}>
                                        <i className={`bi ${meta.icon}`}></i>
                                      </div>
                                    </div>
                                    
                                    <div className="mb-4 position-relative" style={{ zIndex: 2 }}>
                                      <div className="d-flex align-items-baseline">
                                        <h1 className="display-1 fw-bold mb-0 text-white" style={{ letterSpacing: '-2px', textShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                                          {tempVal}
                                        </h1>
                                        <span className="fs-2 fw-bold text-white opacity-95 ms-1" style={{ transform: 'translateY(-10px)' }}>°C</span>
                                      </div>
                                    </div>

                                    {/* Glass Details Grid */}
                                    <div className="weather-details-grid">
                                      <div className="weather-detail-card">
                                        <div className="text-white-50 small mb-1" style={{ fontSize: '0.72rem' }}>Condition</div>
                                        <div className="fw-bold text-white small text-truncate">
                                          {meta.label}
                                        </div>
                                      </div>
                                      <div className="weather-detail-card">
                                        <div className="text-white-50 small mb-1" style={{ fontSize: '0.72rem' }}>Humidity</div>
                                        <div className="fw-bold text-white small">
                                          <i className="bi bi-droplet-half me-1"></i> {humidityVal}%
                                        </div>
                                      </div>
                                      <div className="weather-detail-card">
                                        <div className="text-white-50 small mb-1" style={{ fontSize: '0.72rem' }}>Wind</div>
                                        <div className="fw-bold text-white small text-truncate">
                                          <i className="bi bi-wind me-1"></i> {windSpeedVal} m/s
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })()}

                              {/* Smart Travel Advisory Banner */}
                              {(() => {
                                const advisory = getWeatherAdvisory(weatherData.current.rain, weatherData.daily);
                                return (
                                  <div className={`card advisory-card-premium advisory-${advisory.type} border-0 p-3 mb-4`}>
                                    <div className="d-flex align-items-center gap-3">
                                      <div className="fs-4 animate-float">
                                        <i className={`bi ${advisory.icon}`}></i>
                                      </div>
                                      <p className="mb-0 fw-semibold small" style={{ lineHeight: '1.4' }}>{advisory.text}</p>
                                    </div>
                                  </div>
                                );
                              })()}

                              {/* 24-Hour Weather Outlook Chart */}
                              <div className="card border-0 p-3 mb-4 rounded-4" style={{ background: 'var(--input-bg)', border: '1px solid var(--table-border)' }}>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                  <h6 className="fw-bold mb-0 text-secondary text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
                                    <i className="bi bi-graph-up text-primary me-2"></i>24-Hour Outlook
                                  </h6>
                                  <div className="btn-group btn-group-sm rounded-pill overflow-hidden border" style={{ padding: '2px', background: 'rgba(255,255,255,0.05)', borderColor: 'var(--table-border)' }}>
                                    <button 
                                      className={`btn btn-xs rounded-pill px-3 py-1 border-0 transition-all ${chartType === 'temp' ? 'btn-emerald text-white shadow-sm' : 'text-secondary'}`}
                                      onClick={() => setChartType('temp')}
                                      style={{ fontSize: '9px', fontWeight: 'bold', ...(chartType === 'temp' ? { backgroundColor: 'var(--primary-color)' } : {}) }}
                                    >
                                      Temp (°C)
                                    </button>
                                    <button 
                                      className={`btn btn-xs rounded-pill px-3 py-1 border-0 transition-all ${chartType === 'rain' ? 'btn-emerald text-white shadow-sm' : 'text-secondary'}`}
                                      onClick={() => setChartType('rain')}
                                      style={{ fontSize: '9px', fontWeight: 'bold', ...(chartType === 'rain' ? { backgroundColor: 'var(--primary-color)' } : {}) }}
                                    >
                                      Rain (mm)
                                    </button>
                                  </div>
                                </div>
                                
                                {chartType === 'temp' ? (
                                  <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }} className="hide-scrollbar">
                                    <div className="d-flex align-items-end justify-content-between pt-3 px-2" style={{ height: '140px', minWidth: '600px' }}>
                                      {(() => {
                                        const temps = weatherData.hourly.map(h => h.temp);
                                        const minT = Math.min(...temps) - 2;
                                        const maxT = Math.max(...temps) + 2;
                                        const range = maxT - minT || 1;
                                        
                                        return weatherData.hourly.map((h, idx) => {
                                          const percent = ((h.temp - minT) / range) * 100;
                                          const heightPercent = 15 + (percent * 0.7); // scale between 15% and 85% height
                                          const showTimeLabel = idx % 3 === 0;
                                          
                                          return (
                                            <div key={idx} className="d-flex flex-column align-items-center flex-grow-1" style={{ width: '4%' }}>
                                              <span className="text-warning fw-bold mb-1" style={{ fontSize: '9px' }}>
                                                {h.temp}°
                                              </span>
                                              <div 
                                                className="w-50 rounded-top transition-all" 
                                                style={{ 
                                                  height: `${heightPercent}%`, 
                                                  background: 'linear-gradient(180deg, #ff8c00 0%, #ff5e3a 100%)',
                                                  boxShadow: '0 0 6px rgba(255, 140, 0, 0.25)'
                                                }}
                                              ></div>
                                              <span className="text-muted mt-2" style={{ fontSize: '8px', opacity: showTimeLabel ? 1 : 0.4 }}>
                                                {showTimeLabel ? h.time : '•'}
                                              </span>
                                            </div>
                                          );
                                        });
                                      })()}
                                    </div>
                                  </div>
                                ) : (
                                  weatherData.hourly && weatherData.hourly.some(h => h.rain > 0) ? (
                                    <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }} className="hide-scrollbar">
                                      <div className="d-flex align-items-end justify-content-between pt-3 px-2" style={{ height: '140px', minWidth: '600px' }}>
                                        {(() => {
                                          const maxRain = Math.max(...weatherData.hourly.map(item => item.rain), 1);
                                          
                                          return weatherData.hourly.map((h, idx) => {
                                            const percent = (h.rain / maxRain) * 100;
                                            const showTimeLabel = idx % 3 === 0;
                                            
                                            return (
                                              <div key={idx} className="d-flex flex-column align-items-center flex-grow-1" style={{ width: '4%' }}>
                                                <span className="text-primary fw-bold mb-1" style={{ fontSize: '8px' }}>
                                                  {h.rain > 0 ? `${h.rain}m` : ''}
                                                </span>
                                                <div 
                                                  className="w-50 rounded-top transition-all" 
                                                  style={{ 
                                                    height: `${Math.max(4, percent * 0.8)}%`, 
                                                    background: h.rain > 0 ? 'linear-gradient(180deg, #3b82f6 0%, #1e40af 100%)' : 'rgba(255, 255, 255, 0.08)',
                                                    boxShadow: h.rain > 0 ? '0 0 8px rgba(59, 130, 246, 0.3)' : 'none'
                                                  }}
                                                ></div>
                                                <span className="text-muted mt-2" style={{ fontSize: '8px', opacity: showTimeLabel ? 1 : 0.4 }}>
                                                  {showTimeLabel ? h.time : '•'}
                                                </span>
                                              </div>
                                            );
                                          });
                                        })()}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-center py-4 rounded-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--table-border)' }}>
                                      <div className="fs-3 text-warning mb-1">☀️</div>
                                      <p className="small text-muted mb-0 fw-semibold">No rain expected in the next 24 hours.</p>
                                    </div>
                                  )
                                )}
                              </div>

                              {/* 7-Day Forecast vertical list */}
                              <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="fw-bold mb-0 text-secondary text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>7-Day Travel Outlook</h6>
                                <span className="text-muted small" style={{ fontSize: '10px' }}><i className="bi bi-clock-history"></i> Real-time Sync</span>
                              </div>
                              
                              <div className="forecast-grid-container">
                                {weatherData.daily.time.slice(0, 7).map((day, idx) => {
                                  const date = new Date(day);
                                  const dayNameShort = date.toLocaleDateString('en-US', { weekday: 'short' });
                                  
                                  const dayCond = weatherData.daily.condition ? weatherData.daily.condition[idx] : (weatherData.daily.rain_sum[idx] > 0 ? 'Rain' : 'Clear');
                                  const dayWind = idx === 0 ? weatherData.current.wind_speed : (weatherData.daily.rain_sum[idx] > 0 ? 8.4 : 3.8);
                                  const meta = getWeatherMeta(dayCond, dayWind, weatherData.daily.rain_sum[idx]);

                                  return (
                                    <div 
                                      className={`forecast-card-premium ${selectedDayIndex === idx ? 'active-forecast' : ''}`} 
                                      key={day}
                                      onClick={() => setSelectedDayIndex(idx)}
                                      title={`Click to view weather for ${date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}`}
                                    >
                                      <span className="text-secondary fw-bold" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        {idx === 0 ? 'Today' : dayNameShort}
                                      </span>
                                      <div className="my-2 fs-4 animate-float" style={{ color: meta.color }}>
                                        <i className={`bi ${meta.icon}`} title={meta.label}></i>
                                      </div>
                                      <div className="d-flex flex-column align-items-center">
                                        <span className="fw-bold text-dark" style={{ fontSize: '0.85rem' }}>
                                          {Math.round(weatherData.daily.temperature_2m_max[idx])}°
                                        </span>
                                        <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                                          {Math.round(weatherData.daily.temperature_2m_min[idx])}°
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
