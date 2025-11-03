import { useState, useEffect } from "react";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import ApperIcon from "@/components/ApperIcon";
import { format } from "date-fns";

const TransactionModal = ({ isOpen, onClose, onSave, transaction = null, farms = [], crops = [] }) => {
  const [formData, setFormData] = useState({
    farmId: transaction?.farmId || "",
    cropId: transaction?.cropId || "",
    type: transaction?.type || "expense",
    category: transaction?.category || "",
    amount: transaction?.amount || "",
    description: transaction?.description || "",
    date: transaction?.date || format(new Date(), "yyyy-MM-dd")
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [availableCrops, setAvailableCrops] = useState([]);

  const expenseCategories = [
    "seeds", "fertilizer", "pesticide", "fuel", "equipment", "labor", 
    "irrigation", "maintenance", "insurance", "taxes", "utilities", "other"
  ];

  const incomeCategories = [
    "crop-sales", "livestock-sales", "government-subsidy", "insurance-payout", 
    "equipment-rental", "land-rental", "consulting", "other"
  ];

  useEffect(() => {
    if (transaction) {
      setFormData({
        farmId: transaction.farmId || "",
        cropId: transaction.cropId || "",
        type: transaction.type || "expense",
        category: transaction.category || "",
        amount: transaction.amount || "",
        description: transaction.description || "",
        date: transaction.date || format(new Date(), "yyyy-MM-dd")
      });
    }
  }, [transaction]);

  useEffect(() => {
    if (formData.farmId) {
      const farmCrops = crops.filter(crop => crop.farmId === formData.farmId);
      setAvailableCrops(farmCrops);
      
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
    
    // Reset category when type changes
    if (field === "type") {
      setFormData(prev => ({ ...prev, category: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.farmId) {
      newErrors.farmId = "Please select a farm";
    }
    
    if (!formData.category) {
      newErrors.category = "Please select a category";
    }
    
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }
    
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    
    if (!formData.date) {
      newErrors.date = "Date is required";
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
        amount: parseFloat(formData.amount)
      });
      onClose();
      if (!transaction) {
        setFormData({
          farmId: "",
          cropId: "",
          type: "expense",
          category: "",
          amount: "",
          description: "",
          date: format(new Date(), "yyyy-MM-dd")
        });
        setErrors({});
      }
    } catch (error) {
      console.error("Error saving transaction:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentCategories = () => {
    return formData.type === "expense" ? expenseCategories : incomeCategories;
  };

  const formatCategoryLabel = (category) => {
    return category.split("-").map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                formData.type === "income" 
                  ? "bg-gradient-to-br from-success/20 to-success/30" 
                  : "bg-gradient-to-br from-error/20 to-error/30"
              }`}>
                <ApperIcon 
                  name={formData.type === "income" ? "TrendingUp" : "TrendingDown"} 
                  className={`h-5 w-5 ${
                    formData.type === "income" ? "text-success" : "text-error"
                  }`} 
                />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {transaction ? "Edit Transaction" : "Add Transaction"}
                </h2>
                <p className="text-sm text-gray-500">
                  {transaction ? "Update transaction details" : "Record a new expense or income"}
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
            {/* Type Toggle */}
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => handleChange("type", "expense")}
                className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  formData.type === "expense"
                    ? "bg-white text-error shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <ApperIcon name="TrendingDown" className="h-4 w-4 mr-2" />
                Expense
              </button>
              <button
                type="button"
                onClick={() => handleChange("type", "income")}
                className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  formData.type === "income"
                    ? "bg-white text-success shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <ApperIcon name="TrendingUp" className="h-4 w-4 mr-2" />
                Income
              </button>
            </div>

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Category"
                type="select"
                value={formData.category}
                onChange={(e) => handleChange("category", e.target.value)}
                error={errors.category}
                required
              >
                <option value="">Select a category</option>
                {getCurrentCategories().map((category) => (
                  <option key={category} value={category}>
                    {formatCategoryLabel(category)}
                  </option>
                ))}
              </FormField>

              <FormField
                label="Amount"
                type="number"
                value={formData.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                error={errors.amount}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>

            <FormField
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => handleChange("date", e.target.value)}
              error={errors.date}
              required
            />

            <FormField
              label="Description"
              type="textarea"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              error={errors.description}
              placeholder="Brief description of the transaction"
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
                variant={formData.type === "income" ? "secondary" : "destructive"}
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
                    <ApperIcon name={transaction ? "Save" : "Plus"} className="h-4 w-4 mr-2" />
                    {transaction ? "Update" : "Add"} {formData.type === "income" ? "Income" : "Expense"}
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

export default TransactionModal;