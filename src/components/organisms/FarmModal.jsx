import { useState } from "react";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const FarmModal = ({ isOpen, onClose, onSave, farm = null }) => {
  const [formData, setFormData] = useState({
    name: farm?.name || "",
    size: farm?.size || "",
    unit: farm?.unit || "acres",
    location: farm?.location || ""
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Farm name is required";
    }
    
    if (!formData.size || formData.size <= 0) {
      newErrors.size = "Size must be greater than 0";
    }
    
    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      await onSave({
        ...formData,
        size: parseFloat(formData.size)
      });
      onClose();
      setFormData({
        name: "",
        size: "",
        unit: "acres",
        location: ""
      });
      setErrors({});
    } catch (error) {
      console.error("Error saving farm:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                <ApperIcon name="MapPin" className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {farm ? "Edit Farm" : "Add New Farm"}
                </h2>
                <p className="text-sm text-gray-500">
                  {farm ? "Update farm details" : "Create your farm profile"}
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              label="Farm Name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              error={errors.name}
              placeholder="Enter farm name"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Size"
                type="number"
                value={formData.size}
                onChange={(e) => handleChange("size", e.target.value)}
                error={errors.size}
                placeholder="0"
                step="0.01"
                min="0"
                required
              />

              <FormField
                label="Unit"
                type="select"
                value={formData.unit}
                onChange={(e) => handleChange("unit", e.target.value)}
              >
                <option value="acres">Acres</option>
                <option value="hectares">Hectares</option>
                <option value="sq ft">Square Feet</option>
                <option value="sq m">Square Meters</option>
              </FormField>
            </div>

            <FormField
              label="Location"
              type="text"
              value={formData.location}
              onChange={(e) => handleChange("location", e.target.value)}
              error={errors.location}
              placeholder="City, State or Address"
              required
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
                    <ApperIcon name={farm ? "Save" : "Plus"} className="h-4 w-4 mr-2" />
                    {farm ? "Update Farm" : "Create Farm"}
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

export default FarmModal;