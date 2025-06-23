
import { MenuItem } from '@/hooks/useOrderDemo/types';
import { WeatherData, SmartMenuContextData } from './types';

export const smartSortItems = (
  menuItems: MenuItem[],
  searchQuery: string,
  selectedCategory: string,
  contextData?: SmartMenuContextData,
  weatherData?: WeatherData
): MenuItem[] => {
  let items = [...menuItems];

  // Apply search filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    items = items.filter(item => 
      item.name.toLowerCase().includes(query) ||
      (item.description && item.description.toLowerCase().includes(query)) ||
      (item.category && item.category.toLowerCase().includes(query))
    );
  }

  // Apply category filter
  if (selectedCategory !== 'all') {
    items = items.filter(item => item.category === selectedCategory);
  }

  // Smart sorting based on multiple factors
  return items.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    // Base popularity score
    if (a.popular) scoreA += 50;
    if (b.popular) scoreB += 50;

    // Weather-based recommendations
    if (weatherData && weatherData.temperature) {
      // Hot weather - boost cold drinks and light items
      if (weatherData.temperature > 25) {
        if (a.category === 'Drink' || a.subcategory === 'Cold Drink') scoreA += 30;
        if (b.category === 'Drink' || b.subcategory === 'Cold Drink') scoreB += 30;
      }
      // Cool weather - boost hot items
      if (weatherData.temperature < 18) {
        if (a.subcategory === 'Hot Drink' || a.category === 'Food') scoreA += 30;
        if (b.subcategory === 'Hot Drink' || b.category === 'Food') scoreB += 30;
      }
    }

    // Time-based priorities
    if (contextData) {
      const { timeOfDay } = contextData;
      if (timeOfDay === 'morning') {
        if (a.subcategory === 'Hot Drink' || a.name.toLowerCase().includes('coffee')) scoreA += 25;
        if (b.subcategory === 'Hot Drink' || b.name.toLowerCase().includes('coffee')) scoreB += 25;
      } else if (timeOfDay === 'evening') {
        if (a.subcategory === 'Cocktail' || a.category === 'Drink') scoreA += 25;
        if (b.subcategory === 'Cocktail' || b.category === 'Drink') scoreB += 25;
      }
    }

    // Availability boost
    if (a.available) scoreA += 20;
    if (b.available) scoreB += 20;

    return scoreB - scoreA;
  });
};

export const smartSortCategories = (
  categories: string[],
  contextData?: SmartMenuContextData
): string[] => {
  return categories.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    if (contextData) {
      const { timeOfDay } = contextData;
      
      if (timeOfDay === 'morning') {
        if (a.toLowerCase().includes('drink') || a.toLowerCase().includes('coffee')) scoreA += 10;
        if (b.toLowerCase().includes('drink') || b.toLowerCase().includes('coffee')) scoreB += 10;
      } else if (timeOfDay === 'evening') {
        if (a.toLowerCase().includes('drink') || a.toLowerCase().includes('cocktail')) scoreA += 10;
        if (b.toLowerCase().includes('drink') || b.toLowerCase().includes('cocktail')) scoreB += 10;
      }
    }

    return scoreB - scoreA;
  });
};
