import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Header from "@/components/organisms/Header";
import FarmModal from "@/components/organisms/FarmModal";
import Dashboard from "@/components/pages/Dashboard";
import Crops from "@/components/pages/Crops";
import Tasks from "@/components/pages/Tasks";
import Finances from "@/components/pages/Finances";
import Weather from "@/components/pages/Weather";
import { farmService } from "@/services/api/farmService";
import { toast } from "react-toastify";

function App() {
  const [farms, setFarms] = useState([]);
  const [selectedFarm, setSelectedFarm] = useState("");
  const [isFarmModalOpen, setIsFarmModalOpen] = useState(false);

  const loadFarms = async () => {
    try {
      const farmsData = await farmService.getAll();
      setFarms(farmsData);
      
      // Auto-select first farm if none selected
      if (!selectedFarm && farmsData.length > 0) {
        setSelectedFarm(farmsData[0].Id.toString());
      }
    } catch (error) {
      console.error("Failed to load farms:", error);
    }
  };

  useEffect(() => {
    loadFarms();
  }, []);

  const handleFarmChange = (farmId) => {
    setSelectedFarm(farmId);
  };

  const handleAddFarm = () => {
    setIsFarmModalOpen(true);
  };

  const handleSaveFarm = async (farmData) => {
    try {
      const newFarm = await farmService.create(farmData);
      setFarms(prev => [...prev, newFarm]);
      setSelectedFarm(newFarm.Id.toString());
      toast.success("Farm created successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to create farm");
      throw err;
    }
  };

  // Modal handlers for different entities
  const [activeModal, setActiveModal] = useState(null);

  const handleAddCrop = () => setActiveModal("crop");
  const handleAddTask = () => setActiveModal("task");
  const handleAddTransaction = () => setActiveModal("transaction");

  const closeModal = () => setActiveModal(null);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <Header
          farms={farms}
          selectedFarm={selectedFarm}
          onFarmChange={handleFarmChange}
          onAddFarm={handleAddFarm}
        />
        
        <main className="pt-0 pb-20 lg:pb-0">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <Routes>
              <Route 
                path="/" 
                element={
                  <Dashboard 
                    selectedFarm={selectedFarm}
                    onAddCrop={handleAddCrop}
                    onAddTask={handleAddTask}
                    onAddTransaction={handleAddTransaction}
                  />
                } 
              />
              <Route 
                path="/crops" 
                element={<Crops selectedFarm={selectedFarm} />} 
              />
              <Route 
                path="/tasks" 
                element={<Tasks selectedFarm={selectedFarm} />} 
              />
              <Route 
                path="/finances" 
                element={<Finances selectedFarm={selectedFarm} />} 
              />
              <Route 
                path="/weather" 
                element={<Weather selectedFarm={selectedFarm} farms={farms} />} 
              />
            </Routes>
          </div>
        </main>

        {/* Farm Modal */}
        <FarmModal
          isOpen={isFarmModalOpen}
          onClose={() => setIsFarmModalOpen(false)}
          onSave={handleSaveFarm}
        />

        {/* Toast Container */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          style={{ zIndex: 9999 }}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;