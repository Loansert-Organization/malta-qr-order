#!/usr/bin/env ts-node

/**
 * Malta QR Order - Type Safety Fix Script
 * This script addresses the most critical TypeScript 'any' type issues
 * by providing specific type definitions and fixes.
 */

import fs from 'fs';
import path from 'path';

// Type definitions to replace common 'any' usage
const TYPE_REPLACEMENTS = {
  // Event handlers
  'error: any': 'error: Error',
  'event: any': 'event: Event',
  'data: any': 'data: Record<string, unknown>',
  'response: any': 'response: ApiResponse',
  'item: any': 'item: MenuItem | Record<string, unknown>',
  'user: any': 'user: User | Record<string, unknown>',
  'order: any': 'order: Order | Record<string, unknown>',
  'vendor: any': 'vendor: Vendor | Record<string, unknown>',
  
  // Function parameters
  '(error: any)': '(error: Error)',
  '(data: any)': '(data: Record<string, unknown>)',
  '(item: any)': '(item: Record<string, unknown>)',
  '(response: any)': '(response: Record<string, unknown>)',
  
  // Common patterns
  ': any[]': ': Record<string, unknown>[]',
  ': any = {}': ': Record<string, unknown> = {}',
  ': any = null': ': unknown = null',
  ': any = undefined': ': unknown = undefined',
  
  // Catch blocks
  'catch (error: any)': 'catch (error)',
  'catch(error: any)': 'catch(error)',
  
  // Metadata and config objects
  'metadata: any': 'metadata: Record<string, unknown>',
  'config: any': 'config: Record<string, unknown>',
  'context: any': 'context: Record<string, unknown>',
  'options: any': 'options: Record<string, unknown>',
  'props: any': 'props: Record<string, unknown>',
  'params: any': 'params: Record<string, unknown>',
};

// Files to process (critical components first)
const PRIORITY_FILES = [
  'src/components/MainContent.tsx',
  'src/components/MainContent/Header.tsx',
  'src/components/MainContent/HeroSection.tsx', 
  'src/components/MainContent/LeftColumn.tsx',
  'src/components/SearchSection.tsx',
  'src/components/VoiceSearch.tsx',
  'src/components/admin/AIMonitoring.tsx',
  'src/components/admin/AdminDashboard.tsx',
  'src/components/admin/AnalyticsDashboard.tsx',
  'src/hooks/useAIService.ts',
  'src/hooks/useAISupervision.ts',
  'src/hooks/useAIUpsell.ts',
  'src/hooks/useMaltaAIChat.ts',
  'src/services/adminLoggingService.ts',
  'src/services/aiAssistantService.ts',
  'src/services/auditService.ts',
];

// Required imports to add to files
const REQUIRED_IMPORTS = `
import type { 
  ApiResponse, 
  ApiError, 
  Vendor, 
  MenuItem, 
  Order, 
  Bar,
  AIWaiterLog,
  SystemLog 
} from '@/types/api';
`;

function processFile(filePath: string): boolean {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Add type imports if not present and file uses React
    if (content.includes('import React') && !content.includes('@/types/api')) {
      const importIndex = content.indexOf('\n');
      content = content.slice(0, importIndex) + REQUIRED_IMPORTS + content.slice(importIndex);
      modified = true;
    }

    // Apply type replacements
    for (const [pattern, replacement] of Object.entries(TYPE_REPLACEMENTS)) {
      const regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      if (content.includes(pattern)) {
        content = content.replace(regex, replacement);
        modified = true;
        console.log(`✅ Fixed '${pattern}' in ${filePath}`);
      }
    }

    // Fix common React patterns
    if (content.includes('React.FC<any>')) {
      content = content.replace(/React\.FC<any>/g, 'React.FC<Record<string, unknown>>');
      modified = true;
    }

    // Fix event handler types
    if (content.includes('onClick={(e: any)')) {
      content = content.replace(/onClick=\{\(e: any\)/g, 'onClick={(e: React.MouseEvent)');
      modified = true;
    }

    if (content.includes('onChange={(e: any)')) {
      content = content.replace(/onChange=\{\(e: any\)/g, 'onChange={(e: React.ChangeEvent)');
      modified = true;
    }

    // Save if modified
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`🔧 Updated: ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
    return false;
  }
}

function main() {
  console.log('🚀 Starting Malta QR Order Type Safety Fixes...\n');

  let totalFixed = 0;
  let totalProcessed = 0;

  // Process priority files first
  console.log('📁 Processing priority files...');
  for (const file of PRIORITY_FILES) {
    totalProcessed++;
    if (processFile(file)) {
      totalFixed++;
    }
  }

  // Process additional TypeScript files in common directories
  const directories = [
    'src/components',
    'src/hooks', 
    'src/services',
    'src/utils',
    'src/pages'
  ];

  console.log('\n📁 Processing additional TypeScript files...');
  for (const dir of directories) {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir, { recursive: true })
        .filter(file => typeof file === 'string' && file.endsWith('.ts') || file.endsWith('.tsx'))
        .map(file => path.join(dir, file as string))
        .filter(file => !PRIORITY_FILES.includes(file));

      for (const file of files) {
        totalProcessed++;
        if (processFile(file)) {
          totalFixed++;
        }
      }
    }
  }

  console.log('\n📊 Type Fix Summary:');
  console.log(`✅ Files processed: ${totalProcessed}`);
  console.log(`🔧 Files modified: ${totalFixed}`);
  console.log(`⚡ Success rate: ${((totalFixed / totalProcessed) * 100).toFixed(1)}%`);

  if (totalFixed > 0) {
    console.log('\n🎉 Type safety improvements applied!');
    console.log('💡 Next steps:');
    console.log('   1. Run: npm run lint');
    console.log('   2. Run: npm run build');
    console.log('   3. Fix any remaining type errors manually');
    console.log('   4. Test the application thoroughly');
  } else {
    console.log('\n✨ No type fixes needed - great job!');
  }
}

if (require.main === module) {
  main();
}

export { processFile, TYPE_REPLACEMENTS }; 