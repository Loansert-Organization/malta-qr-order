
import { MenuItem, AIInsights, WeatherData } from './types';

export const smartSortItems = (
  menuItems: MenuItem[],
  searchQuery: string,
  selectedCategory: string,
  aiInsights?: AIInsights,
  weatherData?: WeatherData
): MenuItem[] => {
  let items = [...menuItems];

  // Apply search filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    items = items.filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
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

    // AI trending items boost
    if (aiInsights?.trending_items.includes(a.name)) scoreA += 40;
    if (aiInsights?.trending_items.includes(b.name)) scoreB += 40;

    // Weather-based recommendations
    if (weatherData?.recommendations.some(rec => 
      a.category.toLowerCase().includes(rec) || 
      a.name.toLowerCase().includes(rec)
    )) scoreA += 30;
    if (weatherData?.recommendations.some(rec => 
      b.category.toLowerCase().includes(rec) || 
      b.name.toLowerCase().includes(rec)
    )) scoreB += 30;

    // Time-based priorities
    if (aiInsights?.time_based_priorities.includes(a.category.toLowerCase())) scoreA += 25;
    if (aiInsights?.time_based_priorities.includes(b.category.toLowerCase())) scoreB += 25;

    // Availability boost
    if (a.available) scoreA += 20;
    if (b.available) scoreB += 20;

    return scoreB - scoreA;
  });
};

export const smartSortCategories = (
  categories: string[],
  aiInsights?: AIInsights
): string[] => {
  return categories.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    if (aiInsights?.recommended_categories.includes(a.toLowerCase())) scoreA += 10;
    if (aiInsights?.recommended_categories.includes(b.toLowerCase())) scoreB += 10;

    if (aiInsights?.time_based_priorities.includes(a.toLowerCase())) scoreA += 8;
    if (aiInsights?.time_based_priorities.includes(b.toLowerCase())) scoreB += 8;

    return scoreB - scoreA;
  });
};
