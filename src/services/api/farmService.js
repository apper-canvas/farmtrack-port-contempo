import farmsData from "@/services/mockData/farms.json";

class FarmService {
  constructor() {
    this.data = [...farmsData];
  }

  async getAll() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.data];
  }

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const farm = this.data.find(item => item.Id === parseInt(id));
    if (!farm) {
      throw new Error("Farm not found");
    }
    return { ...farm };
  }

  async create(farmData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const maxId = Math.max(...this.data.map(item => item.Id), 0);
    const newFarm = {
      Id: maxId + 1,
      ...farmData,
      createdAt: new Date().toISOString()
    };
    
    this.data.push(newFarm);
    return { ...newFarm };
  }

  async update(id, updateData) {
    await new Promise(resolve => setTimeout(resolve, 350));
    
    const index = this.data.findIndex(item => item.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Farm not found");
    }
    
    this.data[index] = { ...this.data[index], ...updateData };
    return { ...this.data[index] };
  }

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = this.data.findIndex(item => item.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Farm not found");
    }
    
    const deleted = this.data.splice(index, 1)[0];
    return { ...deleted };
  }
}

export const farmService = new FarmService();