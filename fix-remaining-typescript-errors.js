#!/usr/bin/env node

const fs = require('fs');

const fixes = [
  // Remove unused React imports
  { file: 'src/components/SearchSection.tsx', pattern: /import React from 'react';\n/, replacement: '' },
  { file: 'src/components/WelcomeWizard.tsx', pattern: /import React from 'react';\n/, replacement: '' },
  { file: 'src/components/admin/AIMonitoring.tsx', pattern: /import React from 'react';\n/, replacement: '' },
  { file: 'src/components/admin/AISystemVerification/index.tsx', pattern: /import React from 'react';\n/, replacement: '' },
  { file: 'src/components/admin/AccessibilityChecker.tsx', pattern: /import React from 'react';\n/, replacement: '' },
  { file: 'src/components/admin/AdminHeader.tsx', pattern: /import React from 'react';\n/, replacement: '' },
  { file: 'src/components/admin/AdminOverview.tsx', pattern: /import React from 'react';\n/, replacement: '' },
  { file: 'src/components/admin/AnalyticsDashboard.tsx', pattern: /import React from 'react';\n/, replacement: '' },
  { file: 'src/components/admin/FinancialOverview.tsx', pattern: /import React from 'react';\n/, replacement: '' },
  { file: 'src/components/admin/MaltaBarsFetcher/AutomationEngine.tsx', pattern: /import React from 'react';\n/, replacement: '' },
  { file: 'src/components/admin/MaltaBarsFetcher/MenuAnalytics.tsx', pattern: /import React from 'react';\n/, replacement: '' },
  { file: 'src/components/admin/MenuQATool.tsx', pattern: /import React from 'react';\n/, replacement: '' },
  { file: 'src/components/admin/SystemHealth.tsx', pattern: /import React from 'react';\n/, replacement: '' },
  { file: 'src/components/admin/SystemMonitoringDashboard.tsx', pattern: /import React from 'react';\n/, replacement: '' },
  { file: 'src/components/admin/VendorApprovalSystem.tsx', pattern: /import React from 'react';\n/, replacement: '' },

  // Remove unused imports from lucide-react
  { file: 'src/components/SmartMenu/SmartMenuFilters.tsx', pattern: /const commonAllergens = /g, replacement: 'const _commonAllergens = ' },
  { file: 'src/components/SmartMenu/SmartMenuWeatherContext.tsx', pattern: /, contextData, menuItems/g, replacement: '' },
  { file: 'src/components/admin/AIMonitoring.tsx', pattern: /import { Button } from '@\/components\/ui\/button';\n/, replacement: '' },
  { file: 'src/components/admin/AIMonitoring.tsx', pattern: /, Zap/g, replacement: '' },
  { file: 'src/components/admin/AIMonitoring.tsx', pattern: /const getModelBadgeColor = /g, replacement: 'const _getModelBadgeColor = ' },
  { file: 'src/components/admin/AIMonitoring.tsx', pattern: /const getLanguageFlag = /g, replacement: 'const _getLanguageFlag = ' },
  { file: 'src/components/admin/AIMonitoring.tsx', pattern: /, index\) =>/g, replacement: ', _index) =>' },
  { file: 'src/components/admin/AISystemVerification/index.tsx', pattern: /, Bot/g, replacement: '' },
  { file: 'src/components/admin/AdminAuth.tsx', pattern: /import { Button } from '@\/components\/ui\/button';\n/, replacement: '' },
  { file: 'src/components/admin/AdminAuth.tsx', pattern: /import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@\/components\/ui\/card';\n/, replacement: '' },
  { file: 'src/components/admin/AdminAuth.tsx', pattern: /import { Input } from '@\/components\/ui\/input';\n/, replacement: '' },
  { file: 'src/components/admin/AdminHeader.tsx', pattern: /, isAnonymous\) =>/g, replacement: ', _isAnonymous) =>' },
  { file: 'src/components/admin/AdminOrderTracking.tsx', pattern: /import { Button } from '@\/components\/ui\/button';\n/, replacement: '' },
  { file: 'src/components/admin/AdminOrderTracking.tsx', pattern: /import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@\/components\/ui\/card';\n/, replacement: '' },
  { file: 'src/components/admin/AnalyticsDashboard.tsx', pattern: /, TrendingDown/g, replacement: '' },
  { file: 'src/components/admin/AnalyticsDashboard.tsx', pattern: /, Clock/g, replacement: '' },
  { file: 'src/components/admin/AnalyticsDashboard.tsx', pattern: /const data = /g, replacement: 'const _data = ' },
  { file: 'src/components/admin/AnalyticsDashboard.tsx', pattern: /, entry\) =>/g, replacement: ', _entry) =>' },
  { file: 'src/components/admin/CoreAppTester.tsx', pattern: /, Users/g, replacement: '' },
  { file: 'src/components/admin/CoreAppTester.tsx', pattern: /, ShoppingCart/g, replacement: '' },
  { file: 'src/components/admin/CoreAppTester.tsx', pattern: /, Wifi/g, replacement: '' },
  { file: 'src/components/admin/DatabaseExpansionPlanner.tsx', pattern: /, table\) =>/g, replacement: ', _table) =>' },
  { file: 'src/components/admin/FinancialOverview.tsx', pattern: /, BarChart, Bar/g, replacement: '' },
  { file: 'src/components/admin/FullstackAuditReport.tsx', pattern: /, AlertTriangle/g, replacement: '' },
  { file: 'src/components/admin/GDPRCompliance.tsx', pattern: /, AlertCircle/g, replacement: '' },
  { file: 'src/components/admin/ICUPAProductionValidator.tsx', pattern: /const vendors = /g, replacement: 'const _vendors = ' },
  { file: 'src/components/admin/LegalDocumentEditor.tsx', pattern: /import { Input } from '@\/components\/ui\/input';\n/, replacement: '' },
  { file: 'src/components/admin/LiveOrderHeatmap.tsx', pattern: /const intensity = /g, replacement: 'const _intensity = ' },
  { file: 'src/components/admin/MaltaBarsFetcher/AutomationEngine/AutomationControlPanel.tsx', pattern: /, AlertCircle/g, replacement: '' },
  { file: 'src/components/admin/MaltaBarsFetcher/MenuAnalytics.tsx', pattern: /, AlertCircle/g, replacement: '' },
  { file: 'src/components/admin/MaltaBarsFetcher/MenuAnalytics.tsx', pattern: /, entry\) =>/g, replacement: ', _entry) =>' },
  { file: 'src/components/admin/MaltaBarsFetcher/hooks/useMaltaBarsFetcher.ts', pattern: /, incremental\) =>/g, replacement: ', _incremental) =>' },
  { file: 'src/components/admin/MaltaBarsFetcher/hooks/useMaltaBarsFetcher.ts', pattern: /const data = /g, replacement: 'const _data = ' },
  { file: 'src/components/admin/MenuQATool.tsx', pattern: /, CardHeader, CardTitle/g, replacement: '' },
  { file: 'src/components/admin/MenuQATool.tsx', pattern: /import { Badge } from '@\/components\/ui\/badge';\n/, replacement: '' },
  { file: 'src/components/admin/MenuQATool.tsx', pattern: /, Filter/g, replacement: '' },
  { file: 'src/components/admin/MenuQATool.tsx', pattern: /const data = /g, replacement: 'const _data = ' },
  { file: 'src/components/admin/ProductionSystemManager.tsx', pattern: /, Database, Bell, Clock/g, replacement: '' },
  { file: 'src/components/admin/SupportDashboard.tsx', pattern: /, Users/g, replacement: '' },
  { file: 'src/components/admin/SystemHealth.tsx', pattern: /import { toast } from '@\/hooks\/use-toast';\n/, replacement: '' },
  { file: 'src/components/admin/SystemHealth.tsx', pattern: /const data = /g, replacement: 'const _data = ' },
  { file: 'src/components/admin/SystemMonitoringDashboard.tsx', pattern: /, Server, Users, Clock, Wifi/g, replacement: '' },
  { file: 'src/components/admin/SystemMonitoringDashboard.tsx', pattern: /const activeOrders = /g, replacement: 'const _activeOrders = ' },
  { file: 'src/components/admin/VendorApprovalSystem.tsx', pattern: /, AlertTriangle/g, replacement: '' },
];

console.log('🔧 Fixing remaining TypeScript errors...\n');

let totalFixed = 0;
for (const fix of fixes) {
  try {
    if (fs.existsSync(fix.file)) {
      let content = fs.readFileSync(fix.file, 'utf8');
      const originalContent = content;
      content = content.replace(fix.pattern, fix.replacement);
      if (content !== originalContent) {
        fs.writeFileSync(fix.file, content);
        console.log(`✅ Fixed: ${fix.file}`);
        totalFixed++;
      }
    }
  } catch (error) {
    console.error(`❌ Error fixing ${fix.file}:`, error.message);
  }
}

console.log(`\n✨ Fixed ${totalFixed} files`);