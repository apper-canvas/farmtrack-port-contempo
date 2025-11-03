import { useState } from "react";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import StatusBadge from "@/components/molecules/StatusBadge";
import ApperIcon from "@/components/ApperIcon";
import { format, differenceInDays } from "date-fns";

const CropCard = ({ crop, onEdit, onDelete, onViewDetails }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const plantingDate = new Date(crop.plantingDate);
  const expectedHarvest = new Date(crop.expectedHarvest);
  const daysToHarvest = differenceInDays(expectedHarvest, new Date());
  const daysGrowing = differenceInDays(new Date(), plantingDate);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this crop? This action cannot be undone.")) {
      setIsDeleting(true);
      try {
        await onDelete(crop.Id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const getProgressPercentage = () => {
    const totalDays = differenceInDays(expectedHarvest, plantingDate);
    return Math.min(100, Math.max(0, (daysGrowing / totalDays) * 100));
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{crop.name}</h3>
              <StatusBadge status={crop.status} type="crop" />
            </div>
            <p className="text-sm text-gray-600 mb-1">{crop.variety}</p>
            <p className="text-xs text-gray-500">
              {crop.quantity} {crop.unit}
            </p>
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onViewDetails(crop)}
              className="text-gray-500 hover:text-primary"
            >
              <ApperIcon name="Eye" className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(crop)}
              className="text-gray-500 hover:text-primary"
            >
              <ApperIcon name="Edit" className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-gray-500 hover:text-error"
            >
              <ApperIcon 
                name={isDeleting ? "RefreshCw" : "Trash2"} 
                className={`h-4 w-4 ${isDeleting ? "animate-spin" : ""}`} 
              />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Growth Progress</span>
            <span>{Math.round(getProgressPercentage())}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-secondary to-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
          <div>
            <div className="flex items-center text-xs text-gray-500 mb-1">
              <ApperIcon name="Calendar" className="h-3 w-3 mr-1" />
              Planted
            </div>
            <p className="text-sm font-medium text-gray-900">
              {format(plantingDate, "MMM d, yyyy")}
            </p>
            <p className="text-xs text-gray-500">
              {daysGrowing} days ago
            </p>
          </div>
          
          <div>
            <div className="flex items-center text-xs text-gray-500 mb-1">
              <ApperIcon name="Calendar" className="h-3 w-3 mr-1" />
              Expected Harvest
            </div>
            <p className="text-sm font-medium text-gray-900">
              {format(expectedHarvest, "MMM d, yyyy")}
            </p>
            <p className={`text-xs ${
              daysToHarvest < 0 
                ? "text-error" 
                : daysToHarvest < 7 
                  ? "text-warning" 
                  : "text-gray-500"
            }`}>
              {daysToHarvest < 0 
                ? `${Math.abs(daysToHarvest)} days overdue` 
                : daysToHarvest === 0 
                  ? "Today" 
                  : `${daysToHarvest} days remaining`
              }
            </p>
          </div>
        </div>

        {/* Notes */}
        {crop.notes && (
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-start text-xs text-gray-500 mb-1">
              <ApperIcon name="FileText" className="h-3 w-3 mr-1 mt-0.5" />
              Notes
            </div>
            <p className="text-sm text-gray-700 line-clamp-2">
              {crop.notes}
            </p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex items-center space-x-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(crop)}
            className="flex-1 text-xs"
          >
            <ApperIcon name="Eye" className="h-3 w-3 mr-1" />
            View Details
          </Button>
          {crop.status === "ready" && (
            <Badge variant="success" className="animate-pulse">
              Ready to Harvest!
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
};

export default CropCard;