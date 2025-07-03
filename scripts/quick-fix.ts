#!/usr/bin/env ts-node

import fs from 'fs';

// Quick fix for the most critical files
const criticalFixes = [
  {
    file: 'src/components/ErrorBoundaries/AIErrorBoundary.tsx',
    search: 'import React from \'react\';',
    replace: ''
  },
  {
    file: 'src/components/MainContent/MenuSection.tsx', 
    search: ', TabsContent',
    replace: ''
  },
  {
    file: 'src/components/OfflineIndicator.tsx',
    search: 'import React from \'react\';\nimport { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";\nimport { Wifi, WifiOff } from \'lucide-react\';',
    replace: 'import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";\nimport { WifiOff } from \'lucide-react\';'
  }
];

for (const fix of criticalFixes) {
  try {
    if (fs.existsSync(fix.file)) {
      let content = fs.readFileSync(fix.file, 'utf8');
      content = content.replace(fix.search, fix.replace);
      fs.writeFileSync(fix.file, content);
      console.log(`✅ Fixed: ${fix.file}`);
    }
  } catch (error) {
    console.error(`❌ Error fixing ${fix.file}:`, error);
  }
}

console.log('Quick fixes applied!');