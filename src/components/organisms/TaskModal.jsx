import { useState, useEffect } from "react";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import ApperIcon from "@/components/ApperIcon";
import { format, addDays } from "date-fns";

const TaskModal = ({ isOpen, onClose, onSave, task = null, farms = [], crops = [] }) => {
  const [formData, setFormData] = useState({
    farmId: task?.farmId || "",
    cropId: task?.cropId || "",
    title: task?.title || "",
    type: task?.type || "watering",
    description: task?.description || "",
    dueDate: task?.dueDate || format(addDays(new Date(), 1), "yyyy-MM-dd"),
    priority: task?.priority || "medium",
    status: task?.status || "pending"
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [availableCrops, setAvailableCrops] = useState([]);

  useEffect(() => {
    if (task) {
      setFormData({
        farmId: task.farmId || "",
        cropId: task.cropId || "",
        title: task.title || "",
        type: task.type || "watering",
        description: task.description || "",
        dueDate: task.dueDate || format(addDays(new Date(), 1), "yyyy-MM-dd"),
        priority: task.priority || "medium",
        status: task.status || "pending"
      });
    }
  }, [task]);

  useEffect(() => {
    if (formData.farmId) {
      const farmCrops = crops.filter(crop => crop.farmId === formData.farmId);
      setAvailableCrops(farmCrops);
      
      // Reset crop selection if current crop is not in the selected farm
      if (formData.cropId && !farmCrops.find(c => c.Id === formData.cropId)) {
        setFormData(prev => ({ ...prev, cropId: "" }));
      }
    } else {
      setAvailableCrops([]);
      setFormData(prev => ({ ...prev, cropId: "" }));
    }
  }, [formData.farmId, crops]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.farmId) {
      newErrors.farmId = "Please select a farm";
    }
    
    if (!formData.title.trim()) {
      newErrors.title = "Task title is required";
    }
    
    if (!formData.type) {
      newErrors.type = "Task type is required";
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = "Due date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      await onSave(formData);
      onClose();
      if (!task) {
        setFormData({
          farmId: "",
          cropId: "",
          title: "",
          type: "watering",
          description: "",
          dueDate: format(addDays(new Date(), 1), "yyyy-MM-dd"),
          priority: "medium",
          status: "pending"
        });
        setErrors({});
      }
    } catch (error) {
      console.error("Error saving task:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                <ApperIcon name="CheckSquare" className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {task ? "Edit Task" : "Create New Task"}
                </h2>
                <p className="text-sm text-gray-500">
                  {task ? "Update task details" : "Schedule a new farm task"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ApperIcon name="X" className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Farm"
                type="select"
                value={formData.farmId}
                onChange={(e) => handleChange("farmId", e.target.value)}
                error={errors.farmId}
                required
              >
                <option value="">Select a farm</option>
                {farms.map((farm) => (
                  <option key={farm.Id} value={farm.Id}>
                    {farm.name} ({farm.location})
                  </option>
                ))}
              </FormField>

              <FormField
                label="Crop (Optional)"
                type="select"
                value={formData.cropId}
                onChange={(e) => handleChange("cropId", e.target.value)}
                disabled={!formData.farmId}
              >
                <option value="">Select a crop (optional)</option>
                {availableCrops.map((crop) => (
                  <option key={crop.Id} value={crop.Id}>
                    {crop.name} - {crop.variety}
                  </option>
                ))}
              </FormField>
            </div>

            <FormField
              label="Task Title"
              type="text"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              error={errors.title}
              placeholder="e.g., Water tomato plants, Apply fertilizer"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Task Type"
                type="select"
                value={formData.type}
                onChange={(e) => handleChange("type", e.target.value)}
                error={errors.type}
                required
              >
                <option value="watering">Watering</option>
                <option value="fertilizing">Fertilizing</option>
                <option value="harvesting">Harvesting</option>
                <option value="planting">Planting</option>
                <option value="weeding">Weeding</option>
                <option value="spraying">Spraying</option>
                <option value="maintenance">Maintenance</option>
                <option value="inspection">Inspection</option>
                <option value="other">Other</option>
              </FormField>

              <FormField
                label="Priority"
                type="select"
                value={formData.priority}
                onChange={(e) => handleChange("priority", e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Due Date"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange("dueDate", e.target.value)}
                error={errors.dueDate}
                required
              />

              {task && (
                <FormField
                  label="Status"
                  type="select"
                  value={formData.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </FormField>
              )}
            </div>

            <FormField
              label="Description"
              type="textarea"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Additional details about this task (optional)"
            />

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <ApperIcon name="RefreshCw" className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <ApperIcon name={task ? "Save" : "Plus"} className="h-4 w-4 mr-2" />
                    {task ? "Update Task" : "Create Task"}
                  </div>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;