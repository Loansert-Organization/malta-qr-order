#!/usr/bin/env node

/**
 * Comprehensive script to fix all TypeScript unused import errors
 */
const fs = require('fs');
const path = require('path');

// All the specific import fixes from the build errors
const fixes = [
  // Remove unused React imports where not needed (but keep where JSX is used)
  { pattern: /^import React from 'react';\n(?=import)/gm, replacement: '' },
  { pattern: /^import React, { /gm, replacement: 'import { ' },
  
  // Remove specific unused imports from lucide-react
  { pattern: /, SheetTrigger/g, replacement: '' },
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
  { pattern: /, CardHeader/g, replacement: '' },
  { pattern: /, CardTitle/g, replacement: '' },
  { pattern: /, Filter/g, replacement: '' },
  { pattern: /, Database/g, replacement: '' },
  { pattern: /, Bell/g, replacement: '' },
  { pattern: /, Server/g, replacement: '' },
  { pattern: /, Phone/g, replacement: '' },
  { pattern: /, Mail/g, replacement: '' },
  { pattern: /, Input/g, replacement: '' },
  
  // Remove unused UI component imports
  { pattern: /import { Badge } from '@\/components\/ui\/badge';\n/gm, replacement: '' },
  { pattern: /import { Input } from '@\/components\/ui\/input';\n/gm, replacement: '' },
  { pattern: /import { toast } from '@\/hooks\/use-toast';\n/gm, replacement: '' },
  { pattern: /import { toast } from 'sonner';\n/gm, replacement: '' },
  
  // Clean up variables by prefixing with underscore
  { pattern: /const data = /gm, replacement: 'const _data = ' },
  { pattern: /const vendors = /gm, replacement: 'const _vendors = ' },
  { pattern: /const intensity = /gm, replacement: 'const _intensity = ' },
  { pattern: /const table = /gm, replacement: 'const _table = ' },
  { pattern: /const handleEnableNotifications = /gm, replacement: 'const _handleEnableNotifications = ' },
  { pattern: /const commonAllergens = /gm, replacement: 'const _commonAllergens = ' },
  { pattern: /const getModelBadgeColor = /gm, replacement: 'const _getModelBadgeColor = ' },
  { pattern: /const getLanguageFlag = /gm, replacement: 'const _getLanguageFlag = ' },
  { pattern: /const activeOrders = /gm, replacement: 'const _activeOrders = ' },
  
  // Fix function parameters
  { pattern: /, index\) =>/gm, replacement: ', _index) =>' },
  { pattern: /, incremental\) =>/gm, replacement: ', _incremental) =>' },
  { pattern: /, entry\) =>/gm, replacement: ', _entry) =>' },
  
  // Remove unused destructured variables
  { pattern: /  contextData,\n/gm, replacement: '' },
  { pattern: /  vendor,\n/gm, replacement: '' },
  { pattern: /  weatherData,\n/gm, replacement: '' },
  { pattern: /  menuItems,\n/gm, replacement: '' },
  { pattern: /  isAnonymous,\n/gm, replacement: '' },
];

// Files that commonly have these issues - comprehensive list
const TARGET_FILES = [
  'src/components/ErrorBoundaries/AIErrorBoundary.tsx',
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
  'src/components/admin/MaltaBarsFetcher/AutomationEngine/automationUtils.ts',
  'src/components/admin/MaltaBarsFetcher/MenuAnalytics.tsx',
  'src/components/admin/MaltaBarsFetcher/hooks/useMaltaBarsFetcher.ts',
  'src/components/admin/MenuQATool.tsx',
  'src/components/admin/ProductionSystemManager.tsx',
  'src/components/admin/SupportDashboard.tsx',
  'src/components/admin/SystemHealth.tsx',
  'src/components/admin/SystemMonitoringDashboard.tsx',
  'src/components/admin/VendorApproval.tsx'
];

function fixFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    for (const fix of fixes) {
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
    
    // Clean up entire unused import declarations
    content = content.replace(/^import { [^}]* } from '@\/components\/ui\/card';\n/gm, (match) => {
      if (match.includes('CardHeader') && match.includes('CardTitle') && !content.includes('<CardHeader') && !content.includes('<CardTitle')) {
        return '';
      }
      return match;
    });

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

console.log('🔧 Fixing all unused imports comprehensively...\n');

let totalFixed = 0;
for (const file of TARGET_FILES) {
  if (fixFile(file)) {
    totalFixed++;
  }
}

console.log(`\n✨ Fixed ${totalFixed} files`);

// Run the script
if (require.main === module) {
  // Auto-execute when run directly
}
