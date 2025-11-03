import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";
import TabNavigation from "@/components/molecules/TabNavigation";
import TaskCard from "@/components/organisms/TaskCard";
import TaskModal from "@/components/organisms/TaskModal";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { farmService } from "@/services/api/farmService";
import { cropService } from "@/services/api/cropService";
import { taskService } from "@/services/api/taskService";
import { isBefore, startOfDay, isToday } from "date-fns";

const Tasks = ({ selectedFarm }) => {
  const [tasks, setTasks] = useState([]);
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const loadData = async () => {
    try {
      setError("");
      setLoading(true);

      const [tasksData, farmsData, cropsData] = await Promise.all([
        taskService.getAll(),
        farmService.getAll(),
        cropService.getAll()
      ]);

      setTasks(tasksData);
      setFarms(farmsData);
      setCrops(cropsData);
    } catch (err) {
      setError(err.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let filtered = tasks;

    // Filter by selected farm
    if (selectedFarm) {
      filtered = filtered.filter(task => task.farmId === selectedFarm);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by tab
    const today = startOfDay(new Date());
    
    switch (activeTab) {
      case "pending":
        filtered = filtered.filter(task => task.status === "pending");
        break;
      case "overdue":
        filtered = filtered.filter(task => 
          task.status === "pending" && isBefore(startOfDay(new Date(task.dueDate)), today)
        );
        break;
      case "today":
        filtered = filtered.filter(task => 
          task.status === "pending" && isToday(new Date(task.dueDate))
        );
        break;
      case "completed":
        filtered = filtered.filter(task => task.status === "completed");
        break;
      default:
        // "all" - no additional filtering
        break;
    }

    // Sort tasks: overdue first, then by due date
    filtered.sort((a, b) => {
      const aDate = new Date(a.dueDate);
      const bDate = new Date(b.dueDate);
      const aOverdue = task.status === "pending" && isBefore(startOfDay(aDate), today);
      const bOverdue = task.status === "pending" && isBefore(startOfDay(bDate), today);
      
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      
      return aDate - bDate;
    });

    setFilteredTasks(filtered);
  }, [tasks, selectedFarm, searchQuery, activeTab]);

  const handleAddTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (taskData) => {
    try {
      if (editingTask) {
        await taskService.update(editingTask.Id, taskData);
        setTasks(prev => prev.map(task => 
          task.Id === editingTask.Id ? { ...task, ...taskData } : task
        ));
        toast.success("Task updated successfully!");
      } else {
        const newTask = await taskService.create(taskData);
        setTasks(prev => [...prev, newTask]);
        toast.success("Task created successfully!");
      }
    } catch (err) {
      toast.error(err.message || "Failed to save task");
      throw err;
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await taskService.delete(taskId);
      setTasks(prev => prev.filter(task => task.Id !== taskId));
      toast.success("Task deleted successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to delete task");
    }
  };

  const handleToggleComplete = async (taskId) => {
    try {
      const task = tasks.find(t => t.Id === taskId);
      if (!task) return;

      const updatedStatus = task.status === "completed" ? "pending" : "completed";
      const updateData = { 
        ...task, 
        status: updatedStatus,
        completedAt: updatedStatus === "completed" ? new Date().toISOString() : null
      };

      await taskService.update(taskId, updateData);
      setTasks(prev => prev.map(t => 
        t.Id === taskId ? { ...t, ...updateData } : t
      ));
      
      toast.success(
        updatedStatus === "completed" 
          ? "Task marked as completed!" 
          : "Task marked as pending!"
      );
    } catch (err) {
      toast.error(err.message || "Failed to update task status");
    }
  };

  const getTabCounts = () => {
    const baseTasks = selectedFarm 
      ? tasks.filter(task => task.farmId === selectedFarm)
      : tasks;
    
    const today = startOfDay(new Date());
    const overdueTasks = baseTasks.filter(task => 
      task.status === "pending" && isBefore(startOfDay(new Date(task.dueDate)), today)
    );
    const todayTasks = baseTasks.filter(task => 
      task.status === "pending" && isToday(new Date(task.dueDate))
    );

    return [
      { id: "all", label: "All", icon: "List", count: baseTasks.length },
      { id: "pending", label: "Pending", icon: "Clock", count: baseTasks.filter(t => t.status === "pending").length },
      { id: "overdue", label: "Overdue", icon: "AlertCircle", count: overdueTasks.length },
      { id: "today", label: "Due Today", icon: "CalendarDays", count: todayTasks.length },
      { id: "completed", label: "Completed", icon: "CheckCircle2", count: baseTasks.filter(t => t.status === "completed").length }
    ];
  };

  if (loading) {
    return <Loading variant="list" />;
  }

  if (error) {
    return <Error error={error} onRetry={loadData} />;
  }

  if (!selectedFarm) {
    return (
      <Empty 
        icon="MapPin"
        title="No Farm Selected"
        description="Please select a farm from the header to manage your tasks."
        actionLabel="Select Farm"
        onAction={() => window.scrollTo(0, 0)}
      />
    );
  }

  const tabData = getTabCounts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
          <p className="text-gray-600">Schedule and track your farm activities</p>
        </div>
        
        <Button onClick={handleAddTask} className="bg-gradient-to-r from-secondary to-primary">
          <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
          Create Task
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <SearchBar
          placeholder="Search tasks by title, type, or description..."
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

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <Empty 
          icon="CheckSquare"
          title={searchQuery || activeTab !== "all" ? "No Tasks Found" : "No Tasks Scheduled"}
          description={
            searchQuery || activeTab !== "all"
              ? "Try adjusting your search or filters to find tasks."
              : "Get organized by creating your first task. Schedule watering, fertilizing, harvesting, and other farm activities."
          }
          actionLabel="Create First Task"
          onAction={handleAddTask}
        />
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.Id}
              task={task}
              crops={crops}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onToggleComplete={handleToggleComplete}
            />
          ))}
        </div>
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        task={editingTask}
        farms={farms}
        crops={crops}
      />
    </div>
  );
};

export default Tasks;