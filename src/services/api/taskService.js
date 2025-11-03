import tasksData from "@/services/mockData/tasks.json";

class TaskService {
  constructor() {
    this.data = [...tasksData];
  }

  async getAll() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.data];
  }

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const task = this.data.find(item => item.Id === parseInt(id));
    if (!task) {
      throw new Error("Task not found");
    }
    return { ...task };
  }

  async create(taskData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const maxId = Math.max(...this.data.map(item => item.Id), 0);
    const newTask = {
      Id: maxId + 1,
      ...taskData,
      createdAt: new Date().toISOString()
    };
    
    this.data.push(newTask);
    return { ...newTask };
  }

  async update(id, updateData) {
    await new Promise(resolve => setTimeout(resolve, 350));
    
    const index = this.data.findIndex(item => item.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Task not found");
    }
    
    this.data[index] = { ...this.data[index], ...updateData };
    return { ...this.data[index] };
  }

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = this.data.findIndex(item => item.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Task not found");
    }
    
    const deleted = this.data.splice(index, 1)[0];
    return { ...deleted };
  }
}

export const taskService = new TaskService();