import { useState, useEffect } from "react";
import Card from "@/components/atoms/Card";
import WeatherCard from "@/components/organisms/WeatherCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { weatherService } from "@/services/api/weatherService";
import { format } from "date-fns";

const Weather = ({ selectedFarm, farms }) => {
  const [weather, setWeather] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadWeatherData = async () => {
    try {
      setError("");
      setLoading(true);

      const weatherData = await weatherService.getAll();
      setWeather(weatherData);
    } catch (err) {
      setError(err.message || "Failed to load weather data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeatherData();
  }, []);

  if (loading) {
    return <Loading variant="card" />;
  }

  if (error) {
    return <Error error={error} onRetry={loadWeatherData} />;
  }

  if (!selectedFarm) {
    return (
      <Empty 
        icon="MapPin"
        title="No Farm Selected"
        description="Please select a farm from the header to view weather information."
        actionLabel="Select Farm"
        onAction={() => window.scrollTo(0, 0)}
      />
    );
  }

  const selectedFarmData = farms.find(f => f.Id === selectedFarm);
  const todayWeather = weather[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Weather Forecast</h1>
          <p className="text-gray-600">
            5-day weather outlook for {selectedFarmData?.name || "your farm"}
          </p>
          {selectedFarmData && (
            <p className="text-sm text-gray-500 flex items-center mt-1">
              <ApperIcon name="MapPin" className="h-4 w-4 mr-1" />
              {selectedFarmData.location}
            </p>
          )}
        </div>
        
        <button 
          onClick={loadWeatherData}
          className="flex items-center text-sm text-primary hover:text-primary/80 transition-colors"
        >
          <ApperIcon name="RefreshCw" className="h-4 w-4 mr-1" />
          Refresh Weather
        </button>
      </div>

      {weather.length === 0 ? (
        <Empty 
          icon="CloudOff"
          title="Weather Data Unavailable"
          description="Weather information is currently unavailable. Please try refreshing or check your connection."
          actionLabel="Refresh Weather"
          onAction={loadWeatherData}
        />
      ) : (
        <>
          {/* Today's Weather Highlight */}
          {todayWeather && (
            <Card className="p-6 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/10">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Today's Weather
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                        <ApperIcon name="Thermometer" className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Temperature</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {todayWeather.temperature?.high || todayWeather.temperature?.current || "--"}°F
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-info/20 rounded-lg flex items-center justify-center">
                        <ApperIcon name="Droplets" className="h-6 w-6 text-info" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Rain Chance</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {todayWeather.precipitation || 0}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                        <ApperIcon name="Waves" className="h-6 w-6 text-secondary" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Humidity</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {todayWeather.humidity || "--"}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-warning/20 rounded-lg flex items-center justify-center">
                        <ApperIcon name="Eye" className="h-6 w-6 text-warning" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Conditions</p>
                        <p className="text-lg font-semibold text-gray-900 capitalize">
                          {todayWeather.condition || "Unknown"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Farming Advice */}
                <Card className="lg:w-80 p-4 bg-white shadow-sm">
                  <h3 className="font-medium text-gray-900 mb-2">Farming Advice</h3>
                  <div className="space-y-2 text-sm">
                    {todayWeather.precipitation >= 50 ? (
                      <div className="flex items-start space-x-2">
                        <ApperIcon name="CloudRain" className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">
                          Heavy rain expected. Avoid field work and equipment operation. Good time for indoor planning.
                        </span>
                      </div>
                    ) : todayWeather.precipitation >= 25 ? (
                      <div className="flex items-start space-x-2">
                        <ApperIcon name="CloudDrizzle" className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">
                          Light rain possible. Plan flexible schedules and avoid irrigation if rain occurs.
                        </span>
                      </div>
                    ) : todayWeather.condition?.toLowerCase().includes("sunny") ? (
                      <div className="flex items-start space-x-2">
                        <ApperIcon name="Sun" className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">
                          Great day for field work! Perfect conditions for planting, harvesting, and equipment maintenance.
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-start space-x-2">
                        <ApperIcon name="Cloud" className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">
                          Good conditions for most farming activities. Monitor weather changes throughout the day.
                        </span>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </Card>
          )}

          {/* 5-Day Forecast */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5-Day Forecast</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {weather.map((day, index) => (
                <WeatherCard 
                  key={day.date} 
                  weather={day} 
                  isToday={index === 0}
                />
              ))}
            </div>
          </div>

          {/* Weather Insights */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <ApperIcon name="Droplets" className="h-4 w-4 mr-2 text-blue-500" />
                  Precipitation Summary
                </h4>
                <div className="space-y-2 text-sm text-gray-600">
                  {weather.filter(day => day.precipitation >= 25).length > 0 ? (
                    <>
                      <p>Rain expected on:</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        {weather.filter(day => day.precipitation >= 25).map(day => (
                          <li key={day.date}>
                            {format(new Date(day.date), "EEEE")} - {day.precipitation}% chance
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <p>No significant rain expected this week. Consider irrigation planning.</p>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <ApperIcon name="Calendar" className="h-4 w-4 mr-2 text-primary" />
                  Best Working Days
                </h4>
                <div className="space-y-2 text-sm text-gray-600">
                  {weather.filter(day => 
                    day.precipitation < 25 && 
                    (day.condition?.toLowerCase().includes("sunny") || day.condition?.toLowerCase().includes("clear"))
                  ).length > 0 ? (
                    <>
                      <p>Ideal conditions for field work:</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        {weather.filter(day => 
                          day.precipitation < 25 && 
                          (day.condition?.toLowerCase().includes("sunny") || day.condition?.toLowerCase().includes("clear"))
                        ).slice(0, 3).map(day => (
                          <li key={day.date}>
                            {format(new Date(day.date), "EEEE")} - {day.condition}
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <p>Variable conditions this week. Plan flexible schedules and monitor daily forecasts.</p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default Weather;