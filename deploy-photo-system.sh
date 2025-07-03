#!/bin/bash

echo "🚀 Deploying Bar Photo System..."
echo "================================"

# Check if we're in the right directory
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Error: Must be run from project root directory"
    exit 1
fi

# Step 1: Apply database migration
echo "📊 Step 1: Applying database migration..."
supabase db push --include supabase/migrations/20250127000000_add_photo_infrastructure.sql

if [ $? -ne 0 ]; then
    echo "❌ Failed to apply database migration"
    exit 1
fi

# Step 2: Deploy Edge Functions
echo "⚡ Step 2: Deploying Edge Functions..."

# Deploy fetch-bar-photos function
echo "   - Deploying fetch-bar-photos..."
supabase functions deploy fetch-bar-photos

if [ $? -ne 0 ]; then
    echo "❌ Failed to deploy fetch-bar-photos function"
    exit 1
fi

# Deploy cron-fill-photos function
echo "   - Deploying cron-fill-photos..."
supabase functions deploy cron-fill-photos

if [ $? -ne 0 ]; then
    echo "❌ Failed to deploy cron-fill-photos function"
    exit 1
fi

# Step 3: Set up storage bucket if needed
echo "💾 Step 3: Checking storage bucket..."
# This is usually already set up, but we check anyway
supabase storage list | grep -q "bar-photos" || supabase storage create bar-photos --public

# Step 4: Set up CRON schedule (optional - requires database access)
echo "⏰ Step 4: Setting up CRON schedule..."
echo "   Note: Run supabase/functions/cron-schedule.sql in your database to enable nightly photo fetching"

# Step 5: Test the system
echo "🧪 Step 5: Testing the system..."
echo "   To test manually, run: bun run scripts/fetch-bar-photos.ts all"

echo ""
echo "✅ Bar Photo System deployed successfully!"
echo ""
echo "📝 Next steps:"
echo "   1. Set environment variables in Supabase dashboard:"
echo "      - GOOGLE_API_KEY"
echo "      - SUPABASE_SERVICE_ROLE_KEY"
echo "   2. Run the CRON schedule SQL in your database"
echo "   3. Test with: bun run scripts/fetch-bar-photos.ts all"
echo ""
echo "🎯 The system will:"
echo "   - Automatically fetch photos for bars without photos"
echo "   - Run nightly at 2:00 AM Europe/Malta time"
echo "   - Show skeleton loaders in the UI while photos are loading"
echo "   - Auto-update the UI once photos are fetched"

# Make the script executable for future runs
chmod +x scripts/fetch-bar-photos.ts 