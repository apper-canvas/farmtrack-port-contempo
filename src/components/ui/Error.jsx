import { useState } from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const Error = ({ 
  className, 
  error = "Something went wrong", 
  onRetry,
  showRetry = true,
  variant = "default",
  ...props 
}) => {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (onRetry) {
      setIsRetrying(true);
      try {
        await onRetry();
      } finally {
        setIsRetrying(false);
      }
    }
  };

  const variants = {
    default: "text-center py-12 px-6",
    compact: "text-center py-6 px-4",
    inline: "text-left py-4 px-4 bg-error/10 border border-error/20 rounded-lg"
  };

  return (
    <div className={cn(variants[variant], className)} {...props}>
      <div className="max-w-md mx-auto">
        <div className="mb-4">
          <ApperIcon 
            name="AlertTriangle" 
            className="h-12 w-12 text-error mx-auto mb-4"
          />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Oops! Something went wrong
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            {typeof error === "string" ? error : "We encountered an unexpected error. Please try again."}
          </p>
        </div>
        
        {showRetry && onRetry && (
          <div className="space-y-3">
            <Button
              onClick={handleRetry}
              disabled={isRetrying}
              variant="outline"
              className="w-full"
            >
              <ApperIcon 
                name={isRetrying ? "RefreshCw" : "RefreshCcw"} 
                className={cn("h-4 w-4 mr-2", isRetrying && "animate-spin")}
              />
              {isRetrying ? "Retrying..." : "Try Again"}
            </Button>
            
            <Button
              onClick={() => window.location.reload()}
              variant="ghost"
              size="sm"
              className="w-full text-xs"
            >
              Or refresh the page
            </Button>
          </div>
        )}
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            If this problem persists, please contact support or try refreshing the page.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Error;