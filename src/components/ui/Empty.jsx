import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const Empty = ({ 
  className,
  title = "No data available",
  description = "Get started by adding your first item.",
  actionLabel = "Add Item",
  onAction,
  icon = "Inbox",
  variant = "default",
  ...props 
}) => {
  const variants = {
    default: "text-center py-16 px-6",
    compact: "text-center py-8 px-4",
    card: "text-center py-12 px-6 bg-white rounded-lg shadow-sm border border-gray-200"
  };

  return (
    <div className={cn(variants[variant], className)} {...props}>
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-secondary/20 to-primary/20 mb-4">
            <ApperIcon 
              name={icon} 
              className="h-8 w-8 text-primary"
            />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {title}
          </h3>
          
          <p className="text-gray-600 text-sm leading-relaxed">
            {description}
          </p>
        </div>
        
        {onAction && (
          <Button
            onClick={onAction}
            className="bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-white font-medium"
          >
            <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
            {actionLabel}
          </Button>
        )}
        
        <div className="mt-8 flex items-center justify-center space-x-6 text-xs text-gray-400">
          <div className="flex items-center">
            <ApperIcon name="Seedling" className="h-4 w-4 mr-1" />
            <span>Grow your farm</span>
          </div>
          <div className="flex items-center">
            <ApperIcon name="TrendingUp" className="h-4 w-4 mr-1" />
            <span>Track progress</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Empty;