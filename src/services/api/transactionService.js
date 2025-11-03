import transactionsData from "@/services/mockData/transactions.json";

class TransactionService {
  constructor() {
    this.data = [...transactionsData];
  }

  async getAll() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.data];
  }

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const transaction = this.data.find(item => item.Id === parseInt(id));
    if (!transaction) {
      throw new Error("Transaction not found");
    }
    return { ...transaction };
  }

async create(transactionData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const maxId = Math.max(...this.data.map(item => item.Id), 0);
    const newTransaction = {
      Id: maxId + 1,
      ...transactionData,
      // Ensure farmId and cropId are integers when provided, empty string when not
      farmId: transactionData.farmId ? parseInt(transactionData.farmId) : "",
      cropId: transactionData.cropId ? parseInt(transactionData.cropId) : "",
      createdAt: new Date().toISOString()
    };
    
    this.data.push(newTransaction);
    return { ...newTransaction };
  }

  async update(id, updateData) {
    await new Promise(resolve => setTimeout(resolve, 350));
    
    const index = this.data.findIndex(item => item.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Transaction not found");
    }
    
    this.data[index] = { ...this.data[index], ...updateData };
    return { ...this.data[index] };
  }

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = this.data.findIndex(item => item.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Transaction not found");
    }
    
    const deleted = this.data.splice(index, 1)[0];
    return { ...deleted };
  }
}

export const transactionService = new TransactionService();