import { useState, useEffect } from "react";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import ApperIcon from "@/components/ApperIcon";
import { format } from "date-fns";

const CropModal = ({ isOpen, onClose, onSave, crop = null, farms = [] }) => {
  const [formData, setFormData] = useState({
    farmId: crop?.farmId || "",
    name: crop?.name || "",
    variety: crop?.variety || "",
    quantity: crop?.quantity || "",
    unit: crop?.unit || "seeds",
    plantingDate: crop?.plantingDate || format(new Date(), "yyyy-MM-dd"),
    expectedHarvest: crop?.expectedHarvest || "",
    status: crop?.status || "planted",
    notes: crop?.notes || ""
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (crop) {
      setFormData({
        farmId: crop.farmId || "",
        name: crop.name || "",
        variety: crop.variety || "",
        quantity: crop.quantity || "",
        unit: crop.unit || "seeds",
        plantingDate: crop.plantingDate || format(new Date(), "yyyy-MM-dd"),
        expectedHarvest: crop.expectedHarvest || "",
        status: crop.status || "planted",
        notes: crop.notes || ""
      });
    }
  }, [crop]);

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
    
    if (!formData.name.trim()) {
      newErrors.name = "Crop name is required";
    }
    
    if (!formData.variety.trim()) {
      newErrors.variety = "Variety is required";
    }
    
    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = "Quantity must be greater than 0";
    }
    
    if (!formData.plantingDate) {
      newErrors.plantingDate = "Planting date is required";
    }
    
    if (!formData.expectedHarvest) {
      newErrors.expectedHarvest = "Expected harvest date is required";
    }
    
    if (formData.plantingDate && formData.expectedHarvest && 
        new Date(formData.plantingDate) >= new Date(formData.expectedHarvest)) {
      newErrors.expectedHarvest = "Harvest date must be after planting date";
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
        quantity: parseFloat(formData.quantity)
      });
      onClose();
      if (!crop) {
        setFormData({
          farmId: "",
          name: "",
          variety: "",
          quantity: "",
          unit: "seeds",
          plantingDate: format(new Date(), "yyyy-MM-dd"),
          expectedHarvest: "",
          status: "planted",
          notes: ""
        });
        setErrors({});
      }
    } catch (error) {
      console.error("Error saving crop:", error);
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
                <ApperIcon name="Seedling" className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {crop ? "Edit Crop" : "Add New Crop"}
                </h2>
                <p className="text-sm text-gray-500">
                  {crop ? "Update crop details" : "Record a new crop planting"}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Crop Name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                error={errors.name}
                placeholder="e.g., Corn, Tomatoes, Wheat"
                required
              />

              <FormField
                label="Variety"
                type="text"
                value={formData.variety}
                onChange={(e) => handleChange("variety", e.target.value)}
                error={errors.variety}
                placeholder="e.g., Sweet Corn, Roma Tomatoes"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => handleChange("quantity", e.target.value)}
                error={errors.quantity}
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
                <option value="seeds">Seeds</option>
                <option value="plants">Plants</option>
                <option value="lbs">Pounds</option>
                <option value="kg">Kilograms</option>
                <option value="bushels">Bushels</option>
                <option value="acres">Acres</option>
                <option value="rows">Rows</option>
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Planting Date"
                type="date"
                value={formData.plantingDate}
                onChange={(e) => handleChange("plantingDate", e.target.value)}
                error={errors.plantingDate}
                required
              />

              <FormField
                label="Expected Harvest Date"
                type="date"
                value={formData.expectedHarvest}
                onChange={(e) => handleChange("expectedHarvest", e.target.value)}
                error={errors.expectedHarvest}
                required
              />
            </div>

            <FormField
              label="Status"
              type="select"
              value={formData.status}
              onChange={(e) => handleChange("status", e.target.value)}
            >
              <option value="planted">Planted</option>
              <option value="growing">Growing</option>
              <option value="ready">Ready</option>
              <option value="harvested">Harvested</option>
            </FormField>

            <FormField
              label="Notes"
              type="textarea"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Additional notes about this crop (optional)"
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
                    <ApperIcon name={crop ? "Save" : "Plus"} className="h-4 w-4 mr-2" />
                    {crop ? "Update Crop" : "Add Crop"}
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

export default CropModal;