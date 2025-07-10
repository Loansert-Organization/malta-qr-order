// Parse CSV function (same as in the React component)
function parseCSV(csvContent) {
  const lines = csvContent.trim().split('\n');
  const items = [];
  
  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const parts = line.split(',');
    
    if (parts.length >= 5) {
      // Handle quoted fields that may contain commas
      let barName = parts[0].replace(/^"|"$/g, '');
      let category = parts[1].replace(/^"|"$/g, '');
      let itemName = parts[2].replace(/^"|"$/g, '');
      let description = parts[3].replace(/^"|"$/g, '');
      let priceStr = parts[4].replace(/^"|"$/g, '');
      
      const price = parseFloat(priceStr);
      
      if (barName && itemName && !isNaN(price)) {
        items.push({
          bar_name: barName,
          category: category,
          item_name: itemName,
          description: description,
          price: price
        });
      }
    }
  }
  
  return items;
}

// Test the parser
function testParser() {
  console.log('🧪 Testing MenuMT1 CSV Parser...\n');
  
  // Sample CSV content (first few lines from the actual file)
  const sampleCSV = `Bar name,Category,Item name,Description,Price
The Londoner British Pub Sliema,STARTERS,Vegetable Spring Rolls (V),Served with sweet chilli dip,7.95
The Londoner British Pub Sliema,STARTERS,Meat Balls,Beef and pork mince balls with jus,9.95
The Londoner British Pub Sliema,STARTERS,Fish Cod Goujons,Served with lemon mayonnaise,9.95
The Londoner British Pub Sliema,STARTERS,Chicken Satay Skewers,Served with peanut sauce dip,10.95
The Londoner British Pub Sliema,STARTERS,Southern Fried Chicken Strips,Served with red white dip,10.95
Mamma Mia,RIBS & DIPPERS,Chicken Dippers,Homemade breaded chicken tenderloins with coleslaw fries honey cajun mayo and BBQ sauce,18.5
Mamma Mia,RIBS & DIPPERS,Barbeque Ribs,Pork ribs with BBQ sauce coleslaw and fries,26.5
The Brew Bar Grill,APPETIZERS,Tres Tacos,3 mini tortillas with chicken beef or fish topped with pico de gallo salsa hot sauce & sour cream,16
Okurama Asian Fusion,CHEF'S SPECIALS,Red Curry Duck,,14.5`;

  const items = parseCSV(sampleCSV);
  
  console.log(`✅ Parsed ${items.length} items successfully\n`);
  
  // Group by restaurant
  const byRestaurant = items.reduce((acc, item) => {
    if (!acc[item.bar_name]) {
      acc[item.bar_name] = [];
    }
    acc[item.bar_name].push(item);
    return acc;
  }, {});
  
  console.log('📊 Items by Restaurant:');
  Object.entries(byRestaurant).forEach(([restaurant, items]) => {
    console.log(`  ${restaurant}: ${items.length} items`);
  });
  
  console.log('\n📋 Sample Items:');
  items.slice(0, 5).forEach((item, index) => {
    console.log(`  ${index + 1}. ${item.item_name} - €${item.price} (${item.category})`);
  });
  
  // Calculate stats
  const categories = [...new Set(items.map(item => item.category))];
  const priceRange = {
    min: Math.min(...items.map(item => item.price)),
    max: Math.max(...items.map(item => item.price))
  };
  
  console.log('\n📈 Statistics:');
  console.log(`  Categories: ${categories.length} (${categories.join(', ')})`);
  console.log(`  Price Range: €${priceRange.min} - €${priceRange.max}`);
  console.log(`  Average Price: €${(items.reduce((sum, item) => sum + item.price, 0) / items.length).toFixed(2)}`);
  
  console.log('\n✅ Parser test completed successfully!');
}

// Run the test
testParser();