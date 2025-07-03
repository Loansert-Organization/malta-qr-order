// Test script to invoke the populate-malta-bars-menus edge function
import { supabase } from './src/integrations/supabase/client';

async function testPopulateMaltaBars() {
  console.log('🧪 Testing populate-malta-bars-menus edge function...');
  
  try {
    const { data, error } = await supabase.functions.invoke('populate-malta-bars-menus', {
      body: {}
    });
    
    if (error) {
      console.error('❌ Edge function error:', error);
      return false;
    }
    
    console.log('✅ Edge function result:', data);
    return true;
  } catch (error) {
    console.error('❌ Test error:', error);
    return false;
  }
}

// Export for manual testing
export { testPopulateMaltaBars };