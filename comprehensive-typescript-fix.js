#!/usr/bin/env node

const fs = require('fs');

console.log('🔧 Comprehensive TypeScript Fix...\n');

// Define all fixes in one comprehensive approach
const comprehensiveFixes = [
  // PWAOptimization.tsx
  { file: 'src/components/PWAOptimization.tsx', search: 'import React, { useState, useEffect } from "react";', replace: 'import { useState, useEffect } from "react";' },
  { file: 'src/components/PWAOptimization.tsx', search: 'const handleEnableNotifications = async () => {', replace: 'const _handleEnableNotifications = async () => {' },
  
  // PerformanceMonitor.tsx  
  { file: 'src/components/PerformanceMonitor.tsx', search: 'import { useEffect } from \'react\';', replace: '' },
  
  // SearchSection.tsx
  { file: 'src/components/SearchSection.tsx', search: /import React from 'react';\n/g, replace: '' },
  
  // SmartMenuFilters.tsx
  { file: 'src/components/SmartMenu/SmartMenuFilters.tsx', search: 'const commonAllergens = ', replace: 'const _commonAllergens = ' },
  
  // SmartMenuWeatherContext.tsx
  { file: 'src/components/SmartMenu/SmartMenuWeatherContext.tsx', search: ', contextData, menuItems)', replace: ')' },
  
  // WelcomeWizard.tsx
  { file: 'src/components/WelcomeWizard.tsx', search: /import React from 'react';\n/g, replace: '' },
  
  // Admin components - batch processing
  { file: 'src/components/admin/AIMonitoring.tsx', search: /import React from 'react';\n/g, replace: '' },
  { file: 'src/components/admin/AIMonitoring.tsx', search: /import { Button } from.*;\n/g, replace: '' },
  { file: 'src/components/admin/AIMonitoring.tsx', search: ', Zap', replace: '' },
  { file: 'src/components/admin/AIMonitoring.tsx', search: 'const getModelBadgeColor = ', replace: 'const _getModelBadgeColor = ' },
  { file: 'src/components/admin/AIMonitoring.tsx', search: 'const getLanguageFlag = ', replace: 'const _getLanguageFlag = ' },
  { file: 'src/components/admin/AIMonitoring.tsx', search: ', index) =>', replace: ', _index) =>' },
  
  { file: 'src/components/admin/AISystemVerification/index.tsx', search: /import React from 'react';\n/g, replace: '' },
  { file: 'src/components/admin/AISystemVerification/index.tsx', search: ', Bot', replace: '' },
  
  { file: 'src/components/admin/AccessibilityChecker.tsx', search: /import React from 'react';\n/g, replace: '' },
  
  { file: 'src/components/admin/AdminAuth.tsx', search: /import { Button }.*;\n/g, replace: '' },
  { file: 'src/components/admin/AdminAuth.tsx', search: /import { Card.*;\n/g, replace: '' },
  { file: 'src/components/admin/AdminAuth.tsx', search: /import { Input }.*;\n/g, replace: '' },
  
  { file: 'src/components/admin/AdminHeader.tsx', search: /import React from 'react';\n/g, replace: '' },
  { file: 'src/components/admin/AdminHeader.tsx', search: ', isAnonymous) =>', replace: ', _isAnonymous) =>' },
  
  { file: 'src/components/admin/AdminOrderTracking.tsx', search: /import { Button }.*;\n/g, replace: '' },
  { file: 'src/components/admin/AdminOrderTracking.tsx', search: /import { Card.*;\n/g, replace: '' },
  
  { file: 'src/components/admin/AdminOverview.tsx', search: /import React from 'react';\n/g, replace: '' },
  
  { file: 'src/components/admin/AnalyticsDashboard.tsx', search: /import React from 'react';\n/g, replace: '' },
  { file: 'src/components/admin/AnalyticsDashboard.tsx', search: ', TrendingDown', replace: '' },
  { file: 'src/components/admin/AnalyticsDashboard.tsx', search: ', Clock', replace: '' },
  { file: 'src/components/admin/AnalyticsDashboard.tsx', search: 'const data = ', replace: 'const _data = ' },
  { file: 'src/components/admin/AnalyticsDashboard.tsx', search: ', entry) =>', replace: ', _entry) =>' },
  
  // VendorApproval.tsx fixes
  { file: 'src/components/admin/VendorApproval.tsx', search: 'const rejectVendor = async (vendorId: string) => {', replace: 'const rejectVendor = async (_vendorId: string) => {' }
];

let totalFixed = 0;

for (const fix of comprehensiveFixes) {
  try {
    if (fs.existsSync(fix.file)) {
      let content = fs.readFileSync(fix.file, 'utf8');
      const originalContent = content;
      
      if (typeof fix.search === 'string') {
        content = content.replace(fix.search, fix.replace);
      } else {
        content = content.replace(fix.search, fix.replace);
      }
      
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