import { useState, useEffect } from "react";
import StatsCard from "@/components/molecules/StatsCard";
import WeatherCard from "@/components/organisms/WeatherCard";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import StatusBadge from "@/components/molecules/StatusBadge";
import { farmService } from "@/services/api/farmService";
import { cropService } from "@/services/api/cropService";
import { taskService } from "@/services/api/taskService";
import { transactionService } from "@/services/api/transactionService";
import { weatherService } from "@/services/api/weatherService";
import { format, isAfter, isBefore, startOfDay, startOfMonth, endOfMonth } from "date-fns";

const Dashboard = ({ selectedFarm, onAddCrop, onAddTask, onAddTransaction }) => {
  const [data, setData] = useState({
    farms: [],
    crops: [],
    tasks: [],
    transactions: [],
    weather: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboardData = async () => {
    try {
      setError("");
      setLoading(true);

      const [farms, crops, tasks, transactions, weather] = await Promise.all([
        farmService.getAll(),
        cropService.getAll(),
        taskService.getAll(),
        transactionService.getAll(),
        weatherService.getAll()
      ]);

      setData({ farms, crops, tasks, transactions, weather });
    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return <Loading variant="card" className="p-6" />;
  }

  if (error) {
    return <Error error={error} onRetry={loadDashboardData} />;
  }

  // Filter data by selected farm if available
  const filteredCrops = selectedFarm ? data.crops.filter(crop => crop.farmId === selectedFarm) : data.crops;
  const filteredTasks = selectedFarm ? data.tasks.filter(task => task.farmId === selectedFarm) : data.tasks;
  const filteredTransactions = selectedFarm ? data.transactions.filter(tx => tx.farmId === selectedFarm) : data.transactions;

  // Calculate stats
  const activeCrops = filteredCrops.filter(crop => crop.status !== "harvested").length;
  const pendingTasks = filteredTasks.filter(task => task.status === "pending").length;
  
  const today = startOfDay(new Date());
  const overdueTasks = filteredTasks.filter(task => 
    task.status === "pending" && isBefore(startOfDay(new Date(task.dueDate)), today)
  ).length;

  const currentMonth = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  
  const monthlyTransactions = filteredTransactions.filter(tx => {
    const txDate = new Date(tx.date);
    return txDate >= monthStart && txDate <= monthEnd;
  });
  
  const monthlyExpenses = monthlyTransactions
    .filter(tx => tx.type === "expense")
    .reduce((sum, tx) => sum + tx.amount, 0);
    
  const monthlyIncome = monthlyTransactions
    .filter(tx => tx.type === "income")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const profit = monthlyIncome - monthlyExpenses;

  // Recent activities
  const recentTasks = filteredTasks
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const recentTransactions = filteredTransactions
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  const todayWeather = data.weather[0];

  const selectedFarmData = selectedFarm ? data.farms.find(f => f.Id === selectedFarm) : null;

  if (!selectedFarm) {
    return (
      <Empty 
        icon="MapPin"
        title="No Farm Selected"
        description="Please select a farm from the header to view your dashboard."
        actionLabel="Select Farm"
        onAction={() => window.scrollTo(0, 0)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Farm Header */}
      {selectedFarmData && (
        <Card className="p-6 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/10">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <ApperIcon name="MapPin" className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {selectedFarmData.name}
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <ApperIcon name="Maximize" className="h-4 w-4 mr-1" />
                  {selectedFarmData.size} {selectedFarmData.unit}
                </span>
                <span className="flex items-center">
                  <ApperIcon name="MapPin" className="h-4 w-4 mr-1" />
                  {selectedFarmData.location}
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Active Crops"
          value={activeCrops}
          icon="Seedling"
          change={`${filteredCrops.length} total`}
          changeType="neutral"
        />
        
        <StatsCard
          title="Pending Tasks"
          value={pendingTasks}
          icon="CheckSquare"
          change={overdueTasks > 0 ? `${overdueTasks} overdue` : "On track"}
          changeType={overdueTasks > 0 ? "negative" : "positive"}
        />
        
        <StatsCard
          title="Monthly Expenses"
          value={`$${monthlyExpenses.toLocaleString()}`}
          icon="TrendingDown"
          change={`${monthlyTransactions.filter(tx => tx.type === "expense").length} transactions`}
          changeType="neutral"
        />
        
        <StatsCard
          title="Monthly Profit"
          value={`$${profit.toLocaleString()}`}
          icon={profit >= 0 ? "TrendingUp" : "TrendingDown"}
          change={`Income: $${monthlyIncome.toLocaleString()}`}
          changeType={profit >= 0 ? "positive" : "negative"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Tasks */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Tasks</h3>
              <Button variant="outline" size="sm" onClick={onAddTask}>
                <ApperIcon name="Plus" className="h-4 w-4 mr-1" />
                Add Task
              </Button>
            </div>
            
            {recentTasks.length === 0 ? (
              <Empty 
                icon="CheckSquare"
                title="No Tasks Yet"
                description="Create your first task to track farm activities."
                actionLabel="Add Task"
                onAction={onAddTask}
                variant="compact"
              />
            ) : (
              <div className="space-y-3">
                {recentTasks.map((task) => {
                  const crop = filteredCrops.find(c => c.Id === task.cropId);
                  const isOverdue = task.status === "pending" && 
                    isBefore(startOfDay(new Date(task.dueDate)), today);
                  
                  return (
                    <div key={task.Id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-sm font-medium text-gray-900">
                            {task.title}
                          </h4>
                          <StatusBadge 
                            status={isOverdue ? "overdue" : task.status} 
                            type="task" 
                          />
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{task.type}</span>
                          {crop && (
                            <span className="flex items-center">
                              <ApperIcon name="Seedling" className="h-3 w-3 mr-1" />
                              {crop.name}
                            </span>
                          )}
                          <span className="flex items-center">
                            <ApperIcon name="Calendar" className="h-3 w-3 mr-1" />
                            {format(new Date(task.dueDate), "MMM d")}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Active Crops */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Active Crops</h3>
              <Button variant="outline" size="sm" onClick={onAddCrop}>
                <ApperIcon name="Plus" className="h-4 w-4 mr-1" />
                Add Crop
              </Button>
            </div>
            
            {filteredCrops.length === 0 ? (
              <Empty 
                icon="Seedling"
                title="No Crops Planted"
                description="Add your first crop to start tracking growth."
                actionLabel="Add Crop"
                onAction={onAddCrop}
                variant="compact"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredCrops.slice(0, 4).map((crop) => (
                  <div key={crop.Id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900">
                        {crop.name}
                      </h4>
                      <StatusBadge status={crop.status} type="crop" />
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{crop.variety}</p>
                    <p className="text-xs text-gray-500">
                      {crop.quantity} {crop.unit} • Planted {format(new Date(crop.plantingDate), "MMM d")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Weather */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Weather</h3>
            {todayWeather ? (
              <WeatherCard weather={todayWeather} isToday={true} />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ApperIcon name="CloudOff" className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">Weather data unavailable</p>
              </div>
            )}
          </Card>

          {/* Recent Transactions */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
              <Button variant="outline" size="sm" onClick={onAddTransaction}>
                <ApperIcon name="Plus" className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            
            {recentTransactions.length === 0 ? (
              <Empty 
                icon="DollarSign"
                title="No Transactions"
                description="Start tracking your farm expenses and income."
                actionLabel="Add Transaction"
                onAction={onAddTransaction}
                variant="compact"
              />
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((tx) => (
                  <div key={tx.Id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        tx.type === "income" 
                          ? "bg-success/20 text-success" 
                          : "bg-error/20 text-error"
                      }`}>
                        <ApperIcon 
                          name={tx.type === "income" ? "TrendingUp" : "TrendingDown"} 
                          className="h-4 w-4" 
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {tx.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {tx.category.replace("-", " ")} • {format(new Date(tx.date), "MMM d")}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-medium ${
                      tx.type === "income" ? "text-success" : "text-error"
                    }`}>
                      {tx.type === "income" ? "+" : "-"}${tx.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;