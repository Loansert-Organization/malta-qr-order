
import { Card, CardContent } from '@/components/ui/card';

export interface WeatherData {
  temperature: number;
  condition?: string;
  humidity?: number;
  windSpeed?: number;
}

interface SmartMenuWeatherContextProps {
  weatherData: WeatherData;
  contextData?: any;
  menuItems?: any[];
}

export const SmartMenuWeatherContext = ({ weatherData, contextData, menuItems }: SmartMenuWeatherContextProps) => {
  const getWeatherContext = () => {
    const temp = weatherData.temperature;
    
    if (temp > 25) {
      return '🌞 Hot day - Perfect for cold drinks and light meals';
    } else if (temp < 18) {
      return '🌧️ Cool weather - Great for warm comfort food';
    } else {
      return '🌤️ Pleasant weather - Ideal for any dining choice';
    }
  };

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="p-4">
        <p className="text-sm text-blue-800 text-center">
          {getWeatherContext()}
        </p>
      </CardContent>
    </Card>
  );
};
