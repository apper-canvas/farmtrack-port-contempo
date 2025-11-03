import { useState } from "react";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import StatusBadge from "@/components/molecules/StatusBadge";
import ApperIcon from "@/components/ApperIcon";
import { format, isAfter, isBefore, startOfDay } from "date-fns";

const TaskCard = ({ task, crops = [], onEdit, onDelete, onToggleComplete }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const taskDate = new Date(task.dueDate);
  const today = startOfDay(new Date());
  const taskDay = startOfDay(taskDate);
  
  const isOverdue = isBefore(taskDay, today) && task.status !== "completed";
  const isDueToday = taskDay.getTime() === today.getTime();

  const crop = crops.find(c => c.Id === task.cropId);

  const handleToggleComplete = async () => {
    setIsUpdating(true);
    try {
      await onToggleComplete(task.Id);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      setIsDeleting(true);
      try {
        await onDelete(task.Id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const getTaskTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "watering":
        return "Droplets";
      case "fertilizing":
        return "Beaker";
      case "harvesting":
        return "Package";
      case "planting":
        return "Seedling";
      case "weeding":
        return "Scissors";
      case "spraying":
        return "Spray";
      default:
        return "CheckSquare";
    }
  };

  const getStatusColor = () => {
    if (task.status === "completed") return "border-l-success";
    if (isOverdue) return "border-l-error";
    if (isDueToday) return "border-l-warning";
    return "border-l-primary";
  };

  return (
    <Card className={`p-4 border-l-4 ${getStatusColor()} hover:shadow-md transition-all duration-200`}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="flex-shrink-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                task.status === "completed" 
                  ? "bg-success/20 text-success" 
                  : "bg-primary/20 text-primary"
              }`}>
                <ApperIcon name={getTaskTypeIcon(task.type)} className="h-4 w-4" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className={`text-sm font-medium ${
                  task.status === "completed" ? "text-gray-500 line-through" : "text-gray-900"
                }`}>
                  {task.title}
                </h3>
                <StatusBadge 
                  status={isOverdue && task.status !== "completed" ? "overdue" : task.status} 
                  type="task" 
                />
              </div>
              
              {crop && (
                <p className="text-xs text-gray-500 mb-1">
                  <ApperIcon name="Seedling" className="h-3 w-3 inline mr-1" />
                  {crop.name} - {crop.variety}
                </p>
              )}
              
              <p className="text-xs text-gray-600">{task.type}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <StatusBadge status={task.priority} type="priority" />
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-sm text-gray-600 pl-11">
            {task.description}
          </p>
        )}

        {/* Date and Actions */}
        <div className="flex items-center justify-between pl-11">
          <div className="flex items-center text-xs text-gray-500">
            <ApperIcon name="Calendar" className="h-3 w-3 mr-1" />
            <span className={
              isOverdue && task.status !== "completed" 
                ? "text-error font-medium" 
                : isDueToday 
                  ? "text-warning font-medium"
                  : ""
            }>
              {isDueToday ? "Due Today" : format(taskDate, "MMM d, yyyy")}
            </span>
            {isOverdue && task.status !== "completed" && (
              <span className="ml-1 text-error font-medium">(Overdue)</span>
            )}
          </div>

          <div className="flex items-center space-x-1">
            {task.status !== "completed" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleComplete}
                disabled={isUpdating}
                className="text-success hover:text-success hover:bg-success/10 text-xs"
              >
                <ApperIcon 
                  name={isUpdating ? "RefreshCw" : "Check"} 
                  className={`h-3 w-3 mr-1 ${isUpdating ? "animate-spin" : ""}`} 
                />
                Complete
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(task)}
              className="text-gray-500 hover:text-primary w-6 h-6"
            >
              <ApperIcon name="Edit" className="h-3 w-3" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-gray-500 hover:text-error w-6 h-6"
            >
              <ApperIcon 
                name={isDeleting ? "RefreshCw" : "Trash2"} 
                className={`h-3 w-3 ${isDeleting ? "animate-spin" : ""}`} 
              />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TaskCard;