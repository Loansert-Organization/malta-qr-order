
export interface WeatherData {
  temperature: number;
  condition?: string;
  humidity?: number;
  windSpeed?: number;
}

export interface SmartMenuContextData {
  timeOfDay: string;
  location: string;
  weather?: WeatherData;
}
