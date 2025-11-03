import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import { format } from "date-fns";

const WeatherCard = ({ weather, isToday = false }) => {
  const getWeatherIcon = (condition) => {
    const conditionLower = condition?.toLowerCase() || "";
    
    if (conditionLower.includes("sunny") || conditionLower.includes("clear")) {
      return "Sun";
    } else if (conditionLower.includes("partly") || conditionLower.includes("partial")) {
      return "CloudSun";
    } else if (conditionLower.includes("cloud")) {
      return "Cloud";
    } else if (conditionLower.includes("rain")) {
      return "CloudRain";
    } else if (conditionLower.includes("storm") || conditionLower.includes("thunder")) {
      return "Zap";
    } else if (conditionLower.includes("snow")) {
      return "Snowflake";
    } else if (conditionLower.includes("fog") || conditionLower.includes("mist")) {
      return "CloudFog";
    }
    
    return "Cloud";
  };

  const getWeatherColor = (condition) => {
    const conditionLower = condition?.toLowerCase() || "";
    
    if (conditionLower.includes("sunny") || conditionLower.includes("clear")) {
      return "text-yellow-500";
    } else if (conditionLower.includes("rain")) {
      return "text-blue-500";
    } else if (conditionLower.includes("storm")) {
      return "text-purple-500";
    } else if (conditionLower.includes("snow")) {
      return "text-blue-300";
    }
    
    return "text-gray-500";
  };

  const getPrecipitationColor = (precipitation) => {
    if (precipitation >= 50) return "text-error";
    if (precipitation >= 25) return "text-warning";
    return "text-info";
  };

  return (
    <Card className={`p-4 text-center ${isToday ? "ring-2 ring-primary bg-primary/5" : ""} hover:shadow-md transition-all duration-200`}>
      <div className="space-y-3">
        {/* Date */}
        <div className="text-sm font-medium text-gray-600">
          {isToday ? "Today" : format(new Date(weather.date), "EEE, MMM d")}
        </div>

        {/* Weather Icon */}
        <div className="flex justify-center">
          <div className={`w-12 h-12 ${getWeatherColor(weather.condition)} flex items-center justify-center`}>
            <ApperIcon name={getWeatherIcon(weather.condition)} className="w-10 h-10" />
          </div>
        </div>

        {/* Temperature */}
        <div className="space-y-1">
          <div className="text-2xl font-bold text-gray-900">
            {weather.temperature?.high || weather.temperature?.current || "--"}°F
          </div>
          {weather.temperature?.low && (
            <div className="text-sm text-gray-500">
              Low: {weather.temperature.low}°F
            </div>
          )}
        </div>

        {/* Condition */}
        <div className="text-sm text-gray-600 capitalize">
          {weather.condition}
        </div>

        {/* Weather Details */}
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center text-gray-500">
              <ApperIcon name="Droplets" className="h-3 w-3 mr-1" />
              Rain
            </div>
            <span className={getPrecipitationColor(weather.precipitation)}>
              {weather.precipitation || 0}%
            </span>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center text-gray-500">
              <ApperIcon name="Waves" className="h-3 w-3 mr-1" />
              Humidity
            </div>
            <span className="text-gray-700">
              {weather.humidity || "--"}%
            </span>
          </div>
        </div>

        {/* Farming Advice */}
        {isToday && (
          <div className="mt-3 p-2 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-600">
              {weather.precipitation >= 50 
                ? "Heavy rain expected - avoid outdoor work"
                : weather.precipitation >= 25 
                  ? "Light rain possible - plan accordingly"
                  : weather.condition?.toLowerCase().includes("sunny")
                    ? "Great day for field work!"
                    : "Good conditions for farming activities"
              }
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default WeatherCard;