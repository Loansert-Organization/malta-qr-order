
export interface WeatherData {
  condition: string;
  temperature: number;
  humidity: number;
  description: string;
  recommendations: string[];
}

class WeatherService {
  private cache: Map<string, { data: WeatherData; timestamp: number }> = new Map();
  private cacheTimeout = 30 * 60 * 1000; // 30 minutes

  async getWeatherData(location: string = 'Malta'): Promise<WeatherData | null> {
    try {
      // Check cache first
      const cached = this.cache.get(location);
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log('Using cached weather data for', location);
        return cached.data;
      }

      // Use a free weather API (OpenWeatherMap alternative)
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=demo&q=${encodeURIComponent(location)}&aqi=no`
      );

      if (!response.ok) {
        // Fallback to mock data for Malta
        return this.getMaltaFallbackWeather();
      }

      const data = await response.json();
      const weatherData: WeatherData = {
        condition: data.current.condition.text.toLowerCase(),
        temperature: data.current.temp_c,
        humidity: data.current.humidity,
        description: data.current.condition.text,
        recommendations: this.generateWeatherRecommendations(data.current.condition.text, data.current.temp_c)
      };

      // Cache the result
      this.cache.set(location, { data: weatherData, timestamp: Date.now() });
      
      return weatherData;
    } catch (error) {
      console.error('Weather service error:', error);
      return this.getMaltaFallbackWeather();
    }
  }

  private getMaltaFallbackWeather(): WeatherData {
    const hour = new Date().getHours();
    const season = this.getCurrentSeason();
    
    // Generate realistic Malta weather based on time and season
    let condition = 'clear';
    let temperature = 22;
    
    if (season === 'summer') {
      temperature = 25 + Math.random() * 8; // 25-33°C
      condition = hour > 6 && hour < 18 ? 'sunny' : 'clear';
    } else if (season === 'winter') {
      temperature = 12 + Math.random() * 8; // 12-20°C
      condition = Math.random() > 0.7 ? 'rainy' : 'cloudy';
    } else {
      temperature = 18 + Math.random() * 8; // 18-26°C
      condition = Math.random() > 0.8 ? 'cloudy' : 'clear';
    }

    return {
      condition,
      temperature: Math.round(temperature),
      humidity: 60 + Math.random() * 30,
      description: this.getWeatherDescription(condition, temperature),
      recommendations: this.generateWeatherRecommendations(condition, temperature)
    };
  }

  private getCurrentSeason(): string {
    const month = new Date().getMonth();
    if (month >= 5 && month <= 8) return 'summer';
    if (month >= 11 || month <= 1) return 'winter';
    return 'spring_fall';
  }

  private getWeatherDescription(condition: string, temperature: number): string {
    const descriptions = {
      sunny: temperature > 25 ? 'Hot and sunny' : 'Warm and sunny',
      clear: 'Clear skies',
      cloudy: 'Partly cloudy',
      rainy: 'Light rain',
      windy: 'Breezy conditions'
    };

    return descriptions[condition as keyof typeof descriptions] || 'Pleasant weather';
  }

  private generateWeatherRecommendations(condition: string, temperature: number): string[] {
    const recommendations: string[] = [];

    // Temperature-based recommendations
    if (temperature > 28) {
      recommendations.push('cold_drinks', 'ice_cream', 'frozen_cocktails', 'light_salads');
    } else if (temperature > 22) {
      recommendations.push('refreshing_drinks', 'outdoor_seating', 'fresh_seafood');
    } else if (temperature < 18) {
      recommendations.push('hot_drinks', 'warm_soups', 'comfort_food', 'indoor_dining');
    }

    // Condition-based recommendations
    if (condition.includes('sunny') || condition.includes('clear')) {
      recommendations.push('outdoor_dining', 'fresh_juices', 'grilled_items');
    } else if (condition.includes('rain')) {
      recommendations.push('cozy_atmosphere', 'hot_beverages', 'hearty_meals');
    } else if (condition.includes('cloud')) {
      recommendations.push('balanced_menu', 'seasonal_items');
    }

    return [...new Set(recommendations)]; // Remove duplicates
  }

  generateContextualPrompt(weatherData: WeatherData): string {
    const temp = weatherData.temperature;
    const condition = weatherData.condition;

    let prompt = `Current weather in Malta: ${weatherData.description} (${temp}°C). `;

    if (temp > 25) {
      prompt += 'Perfect weather for cold drinks and light meals. ';
    } else if (temp < 18) {
      prompt += 'Cooler weather calls for warm comfort foods. ';
    }

    if (condition.includes('sunny')) {
      prompt += 'Sunny conditions ideal for outdoor dining and fresh items. ';
    } else if (condition.includes('rain')) {
      prompt += 'Rainy weather creates demand for cozy indoor dining and warm beverages. ';
    }

    return prompt;
  }
}

export const weatherService = new WeatherService();
