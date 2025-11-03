import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Chart from "react-apexcharts";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import SearchBar from "@/components/molecules/SearchBar";
import TabNavigation from "@/components/molecules/TabNavigation";
import StatsCard from "@/components/molecules/StatsCard";
import TransactionModal from "@/components/organisms/TransactionModal";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { farmService } from "@/services/api/farmService";
import { cropService } from "@/services/api/cropService";
import { transactionService } from "@/services/api/transactionService";
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, eachMonthOfInterval } from "date-fns";

const Finances = ({ selectedFarm }) => {
  const [transactions, setTransactions] = useState([]);
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [timePeriod, setTimePeriod] = useState("month");
  const [chartsLoading, setChartsLoading] = useState(false);
  const loadData = async () => {
    try {
      setError("");
      setLoading(true);

      const [transactionsData, farmsData, cropsData] = await Promise.all([
        transactionService.getAll(),
        farmService.getAll(),
        cropService.getAll()
      ]);

      setTransactions(transactionsData);
      setFarms(farmsData);
      setCrops(cropsData);
    } catch (err) {
      setError(err.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let filtered = transactions;

    // Filter by selected farm
    if (selectedFarm) {
      filtered = filtered.filter(tx => tx.farmId === selectedFarm);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(tx =>
        tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by transaction type
    if (activeTab !== "all") {
      filtered = filtered.filter(tx => tx.type === activeTab);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    setFilteredTransactions(filtered);
  }, [transactions, selectedFarm, searchQuery, activeTab]);

  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleSaveTransaction = async (transactionData) => {
    try {
      if (editingTransaction) {
        await transactionService.update(editingTransaction.Id, transactionData);
        setTransactions(prev => prev.map(tx => 
          tx.Id === editingTransaction.Id ? { ...tx, ...transactionData } : tx
        ));
        toast.success("Transaction updated successfully!");
      } else {
        const newTransaction = await transactionService.create(transactionData);
        setTransactions(prev => [...prev, newTransaction]);
        toast.success("Transaction added successfully!");
      }
    } catch (err) {
      toast.error(err.message || "Failed to save transaction");
      throw err;
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    if (window.confirm("Are you sure you want to delete this transaction? This action cannot be undone.")) {
      try {
        await transactionService.delete(transactionId);
        setTransactions(prev => prev.filter(tx => tx.Id !== transactionId));
        toast.success("Transaction deleted successfully!");
      } catch (err) {
        toast.error(err.message || "Failed to delete transaction");
      }
    }
  };

  const getDateRange = () => {
    const now = new Date();
    switch (timePeriod) {
      case "month":
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case "lastMonth":
        const lastMonth = subMonths(now, 1);
        return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
      case "year":
        return { start: startOfYear(now), end: endOfYear(now) };
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  };

const getFinancialStats = () => {
    const baseTransactions = selectedFarm 
      ? transactions.filter(tx => tx.farmId === selectedFarm)
      : transactions;
    
    const { start, end } = getDateRange();
    const periodTransactions = baseTransactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate >= start && txDate <= end;
    });

    const expenses = periodTransactions
      .filter(tx => tx.type === "expense")
      .reduce((sum, tx) => sum + tx.amount, 0);
      
    const income = periodTransactions
      .filter(tx => tx.type === "income")
      .reduce((sum, tx) => sum + tx.amount, 0);

    const profit = income - expenses;

    // Chart data preparation
    const expensesByCategory = periodTransactions
      .filter(tx => tx.type === "expense")
      .reduce((acc, tx) => {
        const category = tx.category || "Other";
        acc[category] = (acc[category] || 0) + tx.amount;
        return acc;
      }, {});

    const chartData = {
      expenseDistribution: {
        categories: Object.keys(expensesByCategory),
        values: Object.values(expensesByCategory),
      },
      timelineData: getTimelineData(baseTransactions, start, end)
    };

    return { expenses, income, profit, periodTransactions, chartData };
  };

  const getTimelineData = (transactions, startDate, endDate) => {
    const months = eachMonthOfInterval({ start: startDate, end: endDate });
    
    const monthlyData = months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthTransactions = transactions.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate >= monthStart && txDate <= monthEnd;
      });

      const monthlyIncome = monthTransactions
        .filter(tx => tx.type === "income")
        .reduce((sum, tx) => sum + tx.amount, 0);
      
      const monthlyExpenses = monthTransactions
        .filter(tx => tx.type === "expense")
        .reduce((sum, tx) => sum + tx.amount, 0);

      return {
        month: format(month, "MMM yyyy"),
        income: monthlyIncome,
        expenses: monthlyExpenses,
        profit: monthlyIncome - monthlyExpenses
      };
    });

    return monthlyData;
  };

  const getTabCounts = () => {
    const baseTransactions = selectedFarm 
      ? transactions.filter(tx => tx.farmId === selectedFarm)
      : transactions;

    return [
      { id: "all", label: "All", icon: "DollarSign", count: baseTransactions.length },
      { id: "income", label: "Income", icon: "TrendingUp", count: baseTransactions.filter(tx => tx.type === "income").length },
      { id: "expense", label: "Expenses", icon: "TrendingDown", count: baseTransactions.filter(tx => tx.type === "expense").length }
    ];
  };

  const formatCategoryLabel = (category) => {
    return category.split("-").map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ");
  };

const getCrop = (cropId) => crops.find(c => c.Id === cropId);

  const getExpenseChartOptions = () => ({
    chart: {
      type: 'pie',
      fontFamily: 'Inter, sans-serif',
    },
    labels: [],
    colors: ['#2d5016', '#7cb342', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'],
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
      fontSize: '14px',
      fontFamily: 'Inter, sans-serif',
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            name: {
              fontSize: '16px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
            },
            value: {
              fontSize: '24px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 700,
              formatter: (val) => `$${parseInt(val).toLocaleString()}`
            },
            total: {
              show: true,
              label: 'Total Expenses',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
              formatter: () => `$${(chartData?.expenseDistribution?.values?.reduce((a, b) => a + b, 0) || 0).toLocaleString()}`
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: (val, opts) => {
        const value = opts.w.config.series[opts.seriesIndex];
        return `$${value.toLocaleString()}`;
      },
      style: {
        fontSize: '12px',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 600,
      }
    },
    tooltip: {
      y: {
        formatter: (val) => `$${val.toLocaleString()}`
      }
    }
  });

  const getTimelineChartOptions = () => ({
    chart: {
      type: 'line',
      fontFamily: 'Inter, sans-serif',
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      }
    },
    stroke: {
      curve: 'smooth',
      width: [3, 3, 2]
    },
    colors: ['#4caf50', '#e53935', '#2d5016'],
    xaxis: {
      categories: [],
      labels: {
        style: {
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif',
        }
      }
    },
    yaxis: {
      labels: {
        formatter: (val) => `$${val.toLocaleString()}`,
        style: {
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif',
        }
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      fontSize: '14px',
      fontFamily: 'Inter, sans-serif',
    },
    grid: {
      strokeDashArray: 3,
      borderColor: '#e0e0e0'
    },
    tooltip: {
      y: {
        formatter: (val) => `$${val.toLocaleString()}`
      }
    },
    dataLabels: {
      enabled: false
    }
  });
  if (loading) {
    return <Loading variant="table" />;
  }

  if (error) {
    return <Error error={error} onRetry={loadData} />;
  }

  if (!selectedFarm) {
    return (
      <Empty 
        icon="MapPin"
        title="No Farm Selected"
        description="Please select a farm from the header to view financial data."
        actionLabel="Select Farm"
        onAction={() => window.scrollTo(0, 0)}
      />
    );
  }

const { expenses, income, profit, chartData } = getFinancialStats();
  const tabData = getTabCounts();
  const periodLabel = timePeriod === "month" ? "This Month" : 
                    timePeriod === "lastMonth" ? "Last Month" : "This Year";

  const expenseChartOptions = getExpenseChartOptions();
  const timelineChartOptions = getTimelineChartOptions();
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Management</h1>
          <p className="text-gray-600">Track your farm expenses and income</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="month">This Month</option>
            <option value="lastMonth">Last Month</option>
            <option value="year">This Year</option>
          </select>
          
          <Button onClick={handleAddTransaction} className="bg-gradient-to-r from-secondary to-primary">
            <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title={`${periodLabel} Income`}
          value={`$${income.toLocaleString()}`}
          icon="TrendingUp"
          changeType="positive"
        />
        
        <StatsCard
          title={`${periodLabel} Expenses`}
          value={`$${expenses.toLocaleString()}`}
          icon="TrendingDown"
          changeType="negative"
        />
        
        <StatsCard
          title={`${periodLabel} Profit`}
          value={`$${profit.toLocaleString()}`}
          icon={profit >= 0 ? "TrendingUp" : "TrendingDown"}
          changeType={profit >= 0 ? "positive" : "negative"}
          change={profit >= 0 ? "Profitable" : "Loss"}
        />
      </div>
{/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          {/* Expense Distribution Chart */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary">Expense Distribution</h3>
              <ApperIcon name="PieChart" size={20} className="text-secondary" />
            </div>
            {chartData?.expenseDistribution?.values?.length > 0 ? (
              <div className="h-80">
                <Chart
                  options={{
                    ...expenseChartOptions,
                    labels: chartData.expenseDistribution.categories
                  }}
                  series={chartData.expenseDistribution.values}
                  type="donut"
                  height="100%"
                />
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <ApperIcon name="PieChart" size={48} className="mx-auto mb-2 opacity-50" />
                  <p>No expense data for {periodLabel.toLowerCase()}</p>
                </div>
              </div>
            )}
          </Card>

          {/* Income vs Expenses Timeline */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary">Income vs Expenses Over Time</h3>
              <ApperIcon name="TrendingUp" size={20} className="text-secondary" />
            </div>
            {chartData?.timelineData?.length > 0 ? (
              <div className="h-80">
                <Chart
                  options={{
                    ...timelineChartOptions,
                    xaxis: {
                      ...timelineChartOptions.xaxis,
                      categories: chartData.timelineData.map(d => d.month)
                    }
                  }}
                  series={[
                    {
                      name: 'Income',
                      data: chartData.timelineData.map(d => d.income)
                    },
                    {
                      name: 'Expenses',
                      data: chartData.timelineData.map(d => d.expenses)
                    },
                    {
                      name: 'Profit',
                      data: chartData.timelineData.map(d => d.profit)
                    }
                  ]}
                  type="line"
                  height="100%"
                />
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <ApperIcon name="TrendingUp" size={48} className="mx-auto mb-2 opacity-50" />
                  <p>No timeline data for {periodLabel.toLowerCase()}</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      {/* Search and Filters */}
      <div className="space-y-4">
        <SearchBar
          placeholder="Search transactions by description or category..."
          onSearch={setSearchQuery}
          onClear={() => setSearchQuery("")}
        />
        
        <TabNavigation
          tabs={tabData}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          variant="pills"
        />
      </div>

      {/* Transactions */}
      {filteredTransactions.length === 0 ? (
        <Empty 
          icon="DollarSign"
          title={searchQuery || activeTab !== "all" ? "No Transactions Found" : "No Transactions Yet"}
          description={
            searchQuery || activeTab !== "all"
              ? "Try adjusting your search or filters to find transactions."
              : "Start tracking your farm's financial health by recording your first transaction. Monitor expenses and income to understand profitability."
          }
          actionLabel="Add First Transaction"
          onAction={handleAddTransaction}
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Crop
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => {
                  const crop = getCrop(transaction.cropId);
                  
                  return (
                    <tr key={transaction.Id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(transaction.date), "MMM d, yyyy")}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                            transaction.type === "income" 
                              ? "bg-success/20 text-success" 
                              : "bg-error/20 text-error"
                          }`}>
                            <ApperIcon 
                              name={transaction.type === "income" ? "TrendingUp" : "TrendingDown"} 
                              className="h-4 w-4" 
                            />
                          </div>
                          <span className={`text-sm font-medium capitalize ${
                            transaction.type === "income" ? "text-success" : "text-error"
                          }`}>
                            {transaction.type}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                        <div className="truncate">{transaction.description}</div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                        {formatCategoryLabel(transaction.category)}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {crop ? (
                          <div className="flex items-center">
                            <ApperIcon name="Seedling" className="h-3 w-3 mr-1 text-gray-400" />
                            {crop.name}
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <span className={transaction.type === "income" ? "text-success" : "text-error"}>
                          {transaction.type === "income" ? "+" : "-"}${transaction.amount.toLocaleString()}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <div className="flex items-center justify-center space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditTransaction(transaction)}
                            className="text-gray-500 hover:text-primary w-8 h-8"
                          >
                            <ApperIcon name="Edit" className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteTransaction(transaction.Id)}
                            className="text-gray-500 hover:text-error w-8 h-8"
                          >
                            <ApperIcon name="Trash2" className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        transaction={editingTransaction}
        farms={farms}
        crops={crops}
      />
    </div>
  );
};

export default Finances;