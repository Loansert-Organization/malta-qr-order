#!/usr/bin/env ts-node

/**
 * Quick fix for unused imports
 */
import fs from 'fs';
import path from 'path';

// Common unused imports to fix
const UNUSED_FIXES = [
  // Remove React imports where not needed
  { pattern: /^import React from 'react';\n/gm, replacement: '' },
  { pattern: /^import React, /gm, replacement: 'import ' },
  
  // Fix specific imports
  { pattern: /, SheetTrigger/g, replacement: '' },
  { pattern: /import { Badge } from '@\/components\/ui\/badge';\n/gm, replacement: '' },
  { pattern: /, MapPin/g, replacement: '' },
  { pattern: /, Wifi/g, replacement: '' },
  { pattern: /, CheckCircle/g, replacement: '' },
  { pattern: /, Shield/g, replacement: '' },
  { pattern: /, Users/g, replacement: '' },
  { pattern: /, AlertTriangle/g, replacement: '' },
  { pattern: /, Clock/g, replacement: '' },
  { pattern: /, Button/g, replacement: '' },
  { pattern: /, Zap/g, replacement: '' },
  { pattern: /, Bot/g, replacement: '' },
  { pattern: /, TabsContent/g, replacement: '' },
  { pattern: /, TrendingDown/g, replacement: '' },
  { pattern: /, BarChart/g, replacement: '' },
  { pattern: /, Bar,/g, replacement: ',' },
  { pattern: /, AlertCircle/g, replacement: '' },
  { pattern: /, ShoppingCart/g, replacement: '' },
  
  // Fix unused variables
  { pattern: /  contextData,\n/gm, replacement: '' },
  { pattern: /  vendor,\n/gm, replacement: '' },
  { pattern: /  weatherData,\n/gm, replacement: '' },
  { pattern: /const data = /gm, replacement: 'const _data = ' },
  { pattern: /const processData = /gm, replacement: 'const _processData = ' },
  { pattern: /const handleEnableNotifications = /gm, replacement: 'const _handleEnableNotifications = ' },
  { pattern: /const onOrderComplete = /gm, replacement: 'const _onOrderComplete = ' },
  { pattern: /const commonAllergens = /gm, replacement: 'const _commonAllergens = ' },
  { pattern: /const getModelBadgeColor = /gm, replacement: 'const _getModelBadgeColor = ' },
  { pattern: /const getLanguageFlag = /gm, replacement: 'const _getLanguageFlag = ' },
  { pattern: /, index\) =>/gm, replacement: ', _index) =>' },
  { pattern: /, incremental\) =>/gm, replacement: ', _incremental) =>' },
  { pattern: /const data = /gm, replacement: 'const _data = ' },
  { pattern: /const vendors = /gm, replacement: 'const _vendors = ' },
  { pattern: /const intensity = /gm, replacement: 'const _intensity = ' },
  { pattern: /const table = /gm, replacement: 'const _table = ' },
  { pattern: /, entry\) =>/gm, replacement: ', _entry) =>' },
];

// Files that commonly have these issues
const TARGET_FILES = [
  'src/components/AISystemVerification.tsx',
  'src/components/CartSidebar.tsx',
  'src/components/DynamicHeroSection.tsx',
  'src/components/ErrorBoundaries/AIErrorBoundary.tsx',
  'src/components/MainContent.tsx',
  'src/components/MainContent/HeroSection.tsx',
  'src/components/MainContent/LeftColumn.tsx',
  'src/components/MainContent/MenuSection.tsx',
  'src/components/OfflineIndicator.tsx',
  'src/components/PWAInstallPrompt.tsx',
  'src/components/PWAOptimization.tsx',
  'src/components/PerformanceMonitor.tsx',
  'src/components/SearchSection.tsx',
  'src/components/SmartMenu/SmartMenuFilters.tsx',
  'src/components/SmartMenu/SmartMenuWeatherContext.tsx',
  'src/components/WelcomeWizard.tsx',
  'src/components/admin/AIMonitoring.tsx',
  'src/components/admin/AISystemVerification/index.tsx',
  'src/components/admin/AccessibilityChecker.tsx',
  'src/components/admin/AdminAuth.tsx',
  'src/components/admin/AdminHeader.tsx',
  'src/components/admin/AdminOrderTracking.tsx',
  'src/components/admin/AdminOverview.tsx',
  'src/components/admin/AnalyticsDashboard.tsx',
  'src/components/admin/CoreAppTester.tsx',
  'src/components/admin/DatabaseExpansionPlanner.tsx',
  'src/components/admin/FinancialOverview.tsx',
  'src/components/admin/FullstackAuditReport.tsx',
  'src/components/admin/GDPRCompliance.tsx',
  'src/components/admin/ICUPAProductionValidator.tsx',
  'src/components/admin/LegalDocumentEditor.tsx',
  'src/components/admin/LiveOrderHeatmap.tsx',
  'src/components/admin/MaltaBarsFetcher/AutomationEngine.tsx',
  'src/components/admin/MaltaBarsFetcher/AutomationEngine/AutomationControlPanel.tsx',
  'src/components/admin/MaltaBarsFetcher/MenuAnalytics.tsx',
  'src/components/admin/MaltaBarsFetcher/hooks/useMaltaBarsFetcher.ts',
  'src/components/admin/MaltaBarsFetcher/AutomationEngine/automationUtils.ts',
  'src/components/admin/MenuQATool.tsx'
];

function fixFile(filePath: string): boolean {
  try {
    if (!fs.existsSync(filePath)) {
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    for (const fix of UNUSED_FIXES) {
      const originalContent = content;
      content = content.replace(fix.pattern, fix.replacement);
      if (content !== originalContent) {
        modified = true;
      }
    }

    // Clean up empty import lines
    content = content.replace(/import { } from.*;\n/gm, '');
    content = content.replace(/import {\s*} from.*;\n/gm, '');
    
    // Clean up trailing commas in imports
    content = content.replace(/import { ([^}]*), } from/gm, 'import { $1 } from');
    content = content.replace(/import { , ([^}]*) } from/gm, 'import { $1 } from');

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error);
    return false;
  }
}

function main() {
  console.log('🔧 Fixing unused imports...\n');
  
  let totalFixed = 0;
  
  for (const file of TARGET_FILES) {
    if (fixFile(file)) {
      totalFixed++;
    }
  }
  
  console.log(`\n✨ Fixed ${totalFixed} files`);
}

// Auto-run if script is executed directly  
main();

if (require.main === module) {
  main();
}