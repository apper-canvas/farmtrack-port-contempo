import cropsData from "@/services/mockData/crops.json";

class CropService {
  constructor() {
    this.data = [...cropsData];
  }

  async getAll() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.data];
  }

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const crop = this.data.find(item => item.Id === parseInt(id));
    if (!crop) {
      throw new Error("Crop not found");
    }
    return { ...crop };
  }

  async create(cropData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const maxId = Math.max(...this.data.map(item => item.Id), 0);
    const newCrop = {
      Id: maxId + 1,
      ...cropData,
      createdAt: new Date().toISOString()
    };
    
    this.data.push(newCrop);
    return { ...newCrop };
  }

  async update(id, updateData) {
    await new Promise(resolve => setTimeout(resolve, 350));
    
    const index = this.data.findIndex(item => item.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Crop not found");
    }
    
    this.data[index] = { ...this.data[index], ...updateData };
    return { ...this.data[index] };
  }

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = this.data.findIndex(item => item.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Crop not found");
    }
    
    const deleted = this.data.splice(index, 1)[0];
    return { ...deleted };
  }
}

export const cropService = new CropService();