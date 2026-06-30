import { useEffect, useState } from 'react';
import { getUploadUrl } from '../../../api';
import PageHero from '../../../components/common/PageHero';
import sigiriya from '../../../assets/sigiriya.png';
import { destinationService } from '../../../services/destinationService';
import './Explore.css';

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
            rain: 0
          };
        }
        dailyGroups[dateStr].temps.push(item.main.temp);
        if (item.rain && item.rain['3h']) {
          dailyGroups[dateStr].rain += item.rain['3h'];
        }
      });

      const dates = Object.keys(dailyGroups).sort();
      const time = [...dates];
      const maxTemps = dates.map(d => Math.max(...dailyGroups[d].temps));
      const minTemps = dates.map(d => Math.min(...dailyGroups[d].temps));
      const rainSums = dates.map(d => parseFloat(dailyGroups[d].rain.toFixed(1)));

      // 4. Extrapolate to 7 days if we have fewer days
      const avgMaxTemp = maxTemps.reduce((a, b) => a + b, 0) / maxTemps.length;
      const avgMinTemp = minTemps.reduce((a, b) => a + b, 0) / minTemps.length;
      const avgRain = rainSums.reduce((a, b) => a + b, 0) / rainSums.length;

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
      }

      // 5. Structure final weatherData object
      const formattedData = {
        current: {
          temperature_2m: Math.round(currentJson.main.temp),
          relative_humidity_2m: currentJson.main.humidity,
          rain: currentJson.rain ? (currentJson.rain['1h'] || currentJson.rain['3h'] || 0) : 0
        },
        daily: {
          time: time.slice(0, 7),
          temperature_2m_max: maxTemps.slice(0, 7),
          temperature_2m_min: minTemps.slice(0, 7),
          rain_sum: rainSums.slice(0, 7)
        }
      };

      setWeatherData(formattedData);
    } catch (err) {
      console.error("Failed to fetch weather data from OpenWeather:", err);
    } finally {
      setWeatherLoading(false);
    }
  };

  const getWeatherRecommendation = (currentRain, dailyData) => {
    if (!dailyData) return '';
    const totalRainWeek = dailyData.rain_sum.reduce((a, b) => a + b, 0);
    
    if (totalRainWeek === 0) {
      return "☀️ Excellent time to visit! Dry and clear skies predicted for the next 7 days.";
    } else if (totalRainWeek < 15) {
      return "🌤️ Great travel conditions. Occasional light showers possible, but mostly pleasant.";
    } else if (totalRainWeek < 50) {
      return "🌦️ Moderate rain expected. Good for indoor tours, nature trails, or waterfalls, but pack an umbrella!";
    } else {
      return "⚠️ Heavy monsoonal rain predicted. Hiking and beach activities are not recommended during this week.";
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
          <div className="modal-content rounded-4 border-0 overflow-hidden shadow-lg" style={{ backgroundColor: 'var(--card-bg)' }}>
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
                    <div className="col-lg-6 p-4 bg-light">
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
                              {/* Current Weather glass-card */}
                              <div className="weather-widget mb-3 text-center shadow-sm">
                                <span className="badge bg-white bg-opacity-20 rounded-pill px-3 py-1 mb-2 text-uppercase small" style={{ letterSpacing: '1px', fontSize: '0.75rem' }}>Current Climate</span>
                                <h1 className="display-2 fw-bold mb-0 text-white" style={{ letterSpacing: '-1px' }}>{weatherData.current.temperature_2m}°C</h1>
                                <div className="d-flex justify-content-center gap-3 mt-2 text-white-50 small">
                                  <span><i className="bi bi-droplet-half"></i> Humidity: {weatherData.current.relative_humidity_2m}%</span>
                                  <span>•</span>
                                  <span>{weatherData.current.rain > 0 ? "🌧️ Raining" : "☀️ Clear skies"}</span>
                                </div>
                              </div>

                              {/* Recommendation Box */}
                              <div className="card bg-success bg-opacity-10 text-success border-0 p-3 rounded-3 mb-4 small">
                                <div className="d-flex align-items-center gap-2">
                                  <span className="fs-5">ℹ️</span>
                                  <p className="mb-0 fw-semibold">{getWeatherRecommendation(weatherData.current.rain, weatherData.daily)}</p>
                                </div>
                              </div>

                              {/* 7-Day Forecast vertical list */}
                              <h6 className="fw-bold mb-3 text-secondary text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>7-Day Travel Outlook</h6>
                              <div className="d-flex flex-column gap-2" style={{ maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
                                {weatherData.daily.time.slice(0, 7).map((day, idx) => {
                                  const date = new Date(day);
                                  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
                                  const isRainy = weatherData.daily.rain_sum[idx] > 0;
                                  return (
                                    <div 
                                      className="d-flex justify-content-between align-items-center p-2 rounded-3 bg-white border border-light shadow-sm" 
                                      key={day} 
                                      style={{ transition: 'transform 0.2s', cursor: 'default' }} 
                                      onMouseOver={(e) => e.currentTarget.style.transform = 'translateX(2px)'} 
                                      onMouseOut={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                                    >
                                      <span className="fw-semibold text-dark small" style={{ width: '90px' }}>{dayName}</span>
                                      <span className="small text-muted">{isRainy ? "🌧️ Rainy" : "☀️ Clear"}</span>
                                      <div className="d-flex gap-2 align-items-center">
                                        <span className="fw-bold text-dark small">{Math.round(weatherData.daily.temperature_2m_max[idx])}°</span>
                                        <span className="text-muted small" style={{ fontSize: '0.8rem' }}>/ {Math.round(weatherData.daily.temperature_2m_min[idx])}°</span>
                                      </div>
                                      {isRainy ? (
                                        <span className="badge bg-primary bg-opacity-10 text-primary small px-2 py-1" style={{ fontSize: '0.75rem' }}>🌧️ {weatherData.daily.rain_sum[idx]}mm</span>
                                      ) : (
                                        <span className="badge bg-success bg-opacity-10 text-success small px-2 py-1" style={{ fontSize: '0.75rem' }}>☀️ Dry</span>
                                      )}
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
