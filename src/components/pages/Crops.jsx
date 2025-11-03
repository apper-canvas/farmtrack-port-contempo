import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";
import CropCard from "@/components/organisms/CropCard";
import CropModal from "@/components/organisms/CropModal";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { farmService } from "@/services/api/farmService";
import { cropService } from "@/services/api/cropService";

const Crops = ({ selectedFarm }) => {
  const [crops, setCrops] = useState([]);
  const [farms, setFarms] = useState([]);
  const [filteredCrops, setFilteredCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const statusOptions = [
    { value: "all", label: "All Crops", count: 0 },
    { value: "planted", label: "Planted", count: 0 },
    { value: "growing", label: "Growing", count: 0 },
    { value: "ready", label: "Ready", count: 0 },
    { value: "harvested", label: "Harvested", count: 0 }
  ];

  const loadData = async () => {
    try {
      setError("");
      setLoading(true);

      const [cropsData, farmsData] = await Promise.all([
        cropService.getAll(),
        farmService.getAll()
      ]);

      setCrops(cropsData);
      setFarms(farmsData);
    } catch (err) {
      setError(err.message || "Failed to load crops");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let filtered = crops;

    // Filter by selected farm
    if (selectedFarm) {
      filtered = filtered.filter(crop => crop.farmId === selectedFarm);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(crop =>
        crop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crop.variety.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(crop => crop.status === statusFilter);
    }

    setFilteredCrops(filtered);
  }, [crops, selectedFarm, searchQuery, statusFilter]);

  const handleAddCrop = () => {
    setEditingCrop(null);
    setIsModalOpen(true);
  };

  const handleEditCrop = (crop) => {
    setEditingCrop(crop);
    setIsModalOpen(true);
  };

  const handleSaveCrop = async (cropData) => {
    try {
      if (editingCrop) {
        await cropService.update(editingCrop.Id, cropData);
        setCrops(prev => prev.map(crop => 
          crop.Id === editingCrop.Id ? { ...crop, ...cropData } : crop
        ));
        toast.success("Crop updated successfully!");
      } else {
        const newCrop = await cropService.create(cropData);
        setCrops(prev => [...prev, newCrop]);
        toast.success("Crop added successfully!");
      }
    } catch (err) {
      toast.error(err.message || "Failed to save crop");
      throw err;
    }
  };

  const handleDeleteCrop = async (cropId) => {
    try {
      await cropService.delete(cropId);
      setCrops(prev => prev.filter(crop => crop.Id !== cropId));
      toast.success("Crop deleted successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to delete crop");
    }
  };

  const handleViewDetails = (crop) => {
    // For now, just show edit modal - could expand to read-only detail view
    setEditingCrop(crop);
    setIsModalOpen(true);
  };

  const getStatusCounts = () => {
    const baseCrops = selectedFarm 
      ? crops.filter(crop => crop.farmId === selectedFarm)
      : crops;
      
    return statusOptions.map(option => ({
      ...option,
      count: option.value === "all" 
        ? baseCrops.length 
        : baseCrops.filter(crop => crop.status === option.value).length
    }));
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
        description="Please select a farm from the header to manage your crops."
        actionLabel="Select Farm"
        onAction={() => window.scrollTo(0, 0)}
      />
    );
  }

  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Crop Management</h1>
          <p className="text-gray-600">Track your crops from planting to harvest</p>
        </div>
        
        <Button onClick={handleAddCrop} className="bg-gradient-to-r from-secondary to-primary">
          <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
          Add New Crop
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            placeholder="Search crops by name or variety..."
            onSearch={setSearchQuery}
            onClear={() => setSearchQuery("")}
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2">
          {statusCounts.map((status) => (
            <Button
              key={status.value}
              variant={statusFilter === status.value ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status.value)}
              className="whitespace-nowrap"
            >
              {status.label}
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-white/20 rounded-full">
                {status.count}
              </span>
            </Button>
          ))}
        </div>
      </div>

      {/* Crops Grid */}
      {filteredCrops.length === 0 ? (
        <Empty 
          icon="Seedling"
          title={searchQuery || statusFilter !== "all" ? "No Crops Found" : "No Crops Yet"}
          description={
            searchQuery || statusFilter !== "all"
              ? "Try adjusting your search or filters to find crops."
              : "Get started by planting your first crop. Track growth stages, harvest dates, and crop performance."
          }
          actionLabel="Add First Crop"
          onAction={handleAddCrop}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCrops.map((crop) => (
            <CropCard
              key={crop.Id}
              crop={crop}
              onEdit={handleEditCrop}
              onDelete={handleDeleteCrop}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}

      {/* Crop Modal */}
      <CropModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCrop(null);
        }}
        onSave={handleSaveCrop}
        crop={editingCrop}
        farms={farms}
      />
    </div>
  );
};

export default Crops;