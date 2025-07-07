import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

// This script connects to Supabase, fetches all bars, counts the number of menu items for each,
// and generates a JSON report detailing the menu status.

// SECURITY: Service role key must be provided via environment variable
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://nireplgrlwhwppjtfxbb.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ CRITICAL: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.error('   Set it with: export SUPABASE_SERVICE_ROLE_KEY=your_service_key');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function generateMenuStatusReport() {
  console.log('📊 Generating menu status report...');

  const { data: bars, error: barsError } = await supabase
    .from('bars')
    .select('id, name, has_menu')
    .order('name');

  if (barsError) {
    console.error('❌ Error fetching bars:', barsError);
    return;
  }

  console.log(`Found ${bars.length} bars to process.`);
  const report = [];

  for (const bar of bars) {
    const { count, error: countError } = await supabase
      .from('menu_items')
      .select('id', { count: 'exact', head: true })
      .eq('bar_id', bar.id);

    if (countError) {
      console.error(`⚠️  Error counting menu items for "${bar.name}":`, countError.message);
      report.push({
        bar_name: bar.name,
        has_menu: bar.has_menu,
        menu_items_count: null,
        error: 'Failed to count menu items',
      });
      continue;
    }

    report.push({
      bar_name: bar.name,
      has_menu: bar.has_menu,
      menu_items_count: count,
    });
  }

  try {
    const reportsDir = path.join(process.cwd(), 'reports');
    await fs.mkdir(reportsDir, { recursive: true });
    const reportPath = path.join(reportsDir, 'menus_with_status.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`✅ Report successfully generated at ${reportPath}`);
  } catch (err) {
    console.error('❌ Error writing report file:', err);
  }
}

generateMenuStatusReport().catch(console.error); 