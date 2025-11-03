import weatherData from "@/services/mockData/weather.json";

class WeatherService {
  constructor() {
    this.data = [...weatherData];
  }

  async getAll() {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...this.data];
  }

  async getById(date) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const weather = this.data.find(item => item.date === date);
    if (!weather) {
      throw new Error("Weather data not found");
    }
    return { ...weather };
  }
}

export const weatherService = new WeatherService();