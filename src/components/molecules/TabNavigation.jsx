import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const TabNavigation = ({ 
  tabs, 
  activeTab, 
  onTabChange, 
  className,
  variant = "default",
  ...props 
}) => {
  const variants = {
    default: "border-b border-gray-200 bg-white",
    pills: "bg-gray-100 rounded-lg p-1"
  };

  return (
    <div className={cn(variants[variant], className)} {...props}>
      <nav className="flex space-x-1" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center px-4 py-2 text-sm font-medium transition-all duration-200",
              variant === "default" && [
                "border-b-2 border-transparent hover:border-gray-300 hover:text-gray-700",
                activeTab === tab.id 
                  ? "border-primary text-primary" 
                  : "text-gray-500"
              ],
              variant === "pills" && [
                "rounded-md",
                activeTab === tab.id 
                  ? "bg-white text-primary shadow-sm" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
              ]
            )}
          >
            {tab.icon && (
              <ApperIcon name={tab.icon} className="h-4 w-4 mr-2" />
            )}
            <span className="hidden sm:block">{tab.label}</span>
            <span className="block sm:hidden">{tab.shortLabel || tab.label}</span>
            {tab.count !== undefined && (
              <span className={cn(
                "ml-2 px-2 py-0.5 rounded-full text-xs font-medium",
                activeTab === tab.id 
                  ? "bg-primary/10 text-primary" 
                  : "bg-gray-200 text-gray-600"
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default TabNavigation;