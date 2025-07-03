#!/usr/bin/env node

/**
 * Comprehensive TypeScript error fix script
 */
const fs = require('fs');

const fixes = [
  // Remove unused React imports
  { file: 'src/components/PWAOptimization.tsx', pattern: /import React, { useState, useEffect } from "react";\n/, replacement: 'import { useState, useEffect } from "react";\n' },
  { file: 'src/components/PWAOptimization.tsx', pattern: /, CheckCircle,?\s*/g, replacement: '' },
  { file: 'src/components/PWAOptimization.tsx', pattern: /, Shield,?\s*/g, replacement: '' },
  { file: 'src/components/PWAOptimization.tsx', pattern: /, Users,?\s*/g, replacement: '' },
  { file: 'src/components/PWAOptimization.tsx', pattern: /const _handleEnableNotifications = /g, replacement: 'const handleEnableNotifications = ' },
  
  { file: 'src/components/PerformanceMonitor.tsx', pattern: /import React, { useEffect } from 'react';\n/, replacement: 'import { useEffect } from \'react\';\n' },
  { file: 'src/components/PerformanceMonitor.tsx', pattern: /, AlertTriangle,?\s*/g, replacement: '' },
  { file: 'src/components/PerformanceMonitor.tsx', pattern: /, CheckCircle,?\s*/g, replacement: '' },
  { file: 'src/components/PerformanceMonitor.tsx', pattern: /, Clock,?\s*/g, replacement: '' },
  
  { file: 'src/components/SearchSection.tsx', pattern: /import React from 'react';\n/, replacement: '' },
  
  { file: 'src/components/SmartMenu/SmartMenuFilters.tsx', pattern: /const commonAllergens = /g, replacement: 'const _commonAllergens = ' },
  
  { file: 'src/components/SmartMenu/SmartMenuWeatherContext.tsx', pattern: /, contextData,?\s*/g, replacement: '' },
  { file: 'src/components/SmartMenu/SmartMenuWeatherContext.tsx', pattern: /, menuItems,?\s*/g, replacement: '' },
  
  { file: 'src/components/WelcomeWizard.tsx', pattern: /import React from 'react';\n/, replacement: '' },
  
  { file: 'src/components/admin/AIMonitoring.tsx', pattern: /import React from 'react';\n/, replacement: '' },
  { file: 'src/components/admin/AIMonitoring.tsx', pattern: /import { Button } from '@\/components\/ui\/button';\n/, replacement: '' },
  { file: 'src/components/admin/AIMonitoring.tsx', pattern: /, Zap,?\s*/g, replacement: '' },
  { file: 'src/components/admin/AIMonitoring.tsx', pattern: /const getModelBadgeColor = /g, replacement: 'const _getModelBadgeColor = ' },
  { file: 'src/components/admin/AIMonitoring.tsx', pattern: /const getLanguageFlag = /g, replacement: 'const _getLanguageFlag = ' },
  { file: 'src/components/admin/AIMonitoring.tsx', pattern: /, index\) =>/g, replacement: ', _index) =>' },
  
  { file: 'src/components/admin/AISystemVerification/index.tsx', pattern: /import React from 'react';\n/, replacement: '' },
  { file: 'src/components/admin/AISystemVerification/index.tsx', pattern: /, Bot,?\s*/g, replacement: '' },
  
  { file: 'src/components/admin/AccessibilityChecker.tsx', pattern: /import React from 'react';\n/, replacement: '' },
  
  { file: 'src/components/admin/AdminAuth.tsx', pattern: /import { Button } from '@\/components\/ui\/button';\n/, replacement: '' },
  { file: 'src/components/admin/AdminAuth.tsx', pattern: /import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@\/components\/ui\/card';\n/, replacement: '' },
  { file: 'src/components/admin/AdminAuth.tsx', pattern: /import { Input } from '@\/components\/ui\/input';\n/, replacement: '' },
  
  { file: 'src/components/admin/AdminHeader.tsx', pattern: /import React from 'react';\n/, replacement: '' },
  { file: 'src/components/admin/AdminHeader.tsx', pattern: /, isAnonymous\) =>/g, replacement: ', _isAnonymous) =>' },
  
  { file: 'src/components/admin/AdminOrderTracking.tsx', pattern: /import { Button } from '@\/components\/ui\/button';\n/, replacement: '' },
  { file: 'src/components/admin/AdminOrderTracking.tsx', pattern: /import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@\/components\/ui\/card';\n/, replacement: '' },
  
  { file: 'src/components/admin/AdminOverview.tsx', pattern: /import React from 'react';\n/, replacement: '' },
  
  { file: 'src/components/admin/AnalyticsDashboard.tsx', pattern: /import React from 'react';\n/, replacement: '' },
  { file: 'src/components/admin/AnalyticsDashboard.tsx', pattern: /, TrendingDown,?\s*/g, replacement: '' },
  { file: 'src/components/admin/AnalyticsDashboard.tsx', pattern: /, Clock,?\s*/g, replacement: '' },
  { file: 'src/components/admin/AnalyticsDashboard.tsx', pattern: /const data = /g, replacement: 'const _data = ' },
  { file: 'src/components/admin/AnalyticsDashboard.tsx', pattern: /, entry\) =>/g, replacement: ', _entry) =>' },
  
  { file: 'src/components/admin/VendorApproval.tsx', pattern: /import { Input } from '@\/components\/ui\/input';\n/, replacement: '' },
  { file: 'src/components/admin/VendorApproval.tsx', pattern: /, Phone,?\s*/g, replacement: '' },
  { file: 'src/components/admin/VendorApproval.tsx', pattern: /, Mail,?\s*/g, replacement: '' },
];

console.log('🔧 Fixing TypeScript errors...\n');

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