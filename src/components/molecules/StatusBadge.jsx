import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const StatusBadge = ({ status, type = "crop", className, ...props }) => {
  const getStatusConfig = () => {
    if (type === "crop") {
      switch (status?.toLowerCase()) {
        case "planted":
          return { icon: "Sprout", className: "status-planted", label: "Planted" };
        case "growing":
          return { icon: "Leaf", className: "status-growing", label: "Growing" };
        case "ready":
          return { icon: "CheckCircle", className: "status-ready", label: "Ready" };
        case "harvested":
          return { icon: "Package", className: "status-harvested", label: "Harvested" };
        default:
          return { icon: "Circle", className: "status-planted", label: status || "Unknown" };
      }
    }

    if (type === "task") {
      switch (status?.toLowerCase()) {
        case "pending":
          return { icon: "Clock", className: "status-pending", label: "Pending" };
        case "completed":
          return { icon: "CheckCircle2", className: "status-completed", label: "Completed" };
        case "overdue":
          return { icon: "AlertCircle", className: "status-overdue", label: "Overdue" };
        default:
          return { icon: "Circle", className: "status-pending", label: status || "Unknown" };
      }
    }

    if (type === "priority") {
      switch (status?.toLowerCase()) {
        case "low":
          return { icon: "ArrowDown", className: "priority-low", label: "Low" };
        case "medium":
          return { icon: "Minus", className: "priority-medium", label: "Medium" };
        case "high":
          return { icon: "ArrowUp", className: "priority-high", label: "High" };
        default:
          return { icon: "Minus", className: "priority-medium", label: status || "Unknown" };
      }
    }

    return { icon: "Circle", className: "status-planted", label: status || "Unknown" };
  };

  const { icon, className: statusClass, label } = getStatusConfig();

  return (
    <span 
      className={cn("status-badge", statusClass, className)} 
      {...props}
    >
      <ApperIcon name={icon} className="h-3 w-3" />
      {label}
    </span>
  );
};

export default StatusBadge;