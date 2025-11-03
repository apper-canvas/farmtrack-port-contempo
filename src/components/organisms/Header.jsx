import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const Header = ({ farms = [], selectedFarm, onFarmChange, onAddFarm }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: "Home", path: "/" },
    { id: "crops", label: "Crops", icon: "Seedling", path: "/crops" },
    { id: "tasks", label: "Tasks", icon: "CheckSquare", path: "/tasks" },
    { id: "finances", label: "Finances", icon: "DollarSign", path: "/finances" },
    { id: "weather", label: "Weather", icon: "Cloud", path: "/weather" }
  ];

  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden lg:block bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                  <ApperIcon name="Tractor" className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">FarmTrack</h1>
                  <p className="text-xs text-gray-500">Agriculture Management</p>
                </div>
              </div>
            </div>

            {/* Farm Selector */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <ApperIcon name="MapPin" className="h-4 w-4 text-gray-500" />
                <Select
                  value={selectedFarm}
                  onChange={(e) => onFarmChange(e.target.value)}
                  className="min-w-[200px]"
                >
                  <option value="">Select Farm</option>
                  {farms.map((farm) => (
                    <option key={farm.Id} value={farm.Id}>
                      {farm.name} ({farm.size} {farm.unit})
                    </option>
                  ))}
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onAddFarm}
                >
                  <ApperIcon name="Plus" className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="mt-6">
            <div className="flex space-x-1">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                    isActive(item.path)
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-600 hover:text-primary hover:bg-primary/5"
                  )}
                >
                  <ApperIcon name={item.icon} className="h-4 w-4 mr-2" />
                  {item.label}
                </button>
              ))}
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo and Menu */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-600 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
              >
                <ApperIcon name={isMobileMenuOpen ? "X" : "Menu"} className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                  <ApperIcon name="Tractor" className="h-4 w-4 text-white" />
                </div>
                <h1 className="text-lg font-bold text-gray-900">FarmTrack</h1>
              </div>
            </div>

            {/* Add Farm Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={onAddFarm}
            >
              <ApperIcon name="Plus" className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="mt-4 border-t border-gray-200 pt-4">
              {/* Farm Selector */}
              <div className="mb-4">
                <div className="flex items-center space-x-2">
                  <ApperIcon name="MapPin" className="h-4 w-4 text-gray-500" />
                  <Select
                    value={selectedFarm}
                    onChange={(e) => onFarmChange(e.target.value)}
                    className="flex-1"
                  >
                    <option value="">Select Farm</option>
                    {farms.map((farm) => (
                      <option key={farm.Id} value={farm.Id}>
                        {farm.name} ({farm.size} {farm.unit})
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigate(item.path);
                      setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                      isActive(item.path)
                        ? "bg-primary text-white"
                        : "text-gray-600 hover:text-primary hover:bg-primary/5"
                    )}
                  >
                    <ApperIcon name={item.icon} className="h-4 w-4 mr-3" />
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
        <div className="grid grid-cols-5 h-16">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 text-xs font-medium transition-all duration-200",
                isActive(item.path)
                  ? "text-primary bg-primary/5"
                  : "text-gray-600 hover:text-primary"
              )}
            >
              <ApperIcon name={item.icon} className="h-5 w-5" />
              <span className="text-[10px]">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Header;