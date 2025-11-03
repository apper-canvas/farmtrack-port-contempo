import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const StatsCard = ({ 
  title, 
  value, 
  icon, 
  change, 
  changeType = "neutral",
  className,
  ...props 
}) => {
  const changeColors = {
    positive: "text-success",
    negative: "text-error", 
    neutral: "text-gray-600"
  };

  const changeIcons = {
    positive: "TrendingUp",
    negative: "TrendingDown",
    neutral: "Minus"
  };

  return (
    <Card className={cn("p-6", className)} {...props}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
          {change !== undefined && (
            <div className={cn("flex items-center text-sm", changeColors[changeType])}>
              <ApperIcon 
                name={changeIcons[changeType]} 
                className="h-4 w-4 mr-1" 
              />
              {change}
            </div>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 ml-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
              <ApperIcon name={icon} className="h-6 w-6 text-primary" />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatsCard;