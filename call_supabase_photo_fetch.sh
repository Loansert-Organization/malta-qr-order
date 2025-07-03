#!/bin/bash

# Simple script to call Supabase Edge Function to fetch photos for specific bars

SUPABASE_URL="https://nireplgrlwhwppjtfxbb.supabase.co"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pcmVwbGdybHdod3BwanRmeGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MjYzMzMsImV4cCI6MjA2NjEwMjMzM30.nBdmNTrbS5CvEMV-2k-hkUbUA1NCsi4Xwt69kkrJnvs"

echo "🔍 Fetching photos for Il-Fortizza and Zion Bar & Restaurant..."
echo ""

# Call the fetch-multiple-photos-simple function
curl -X POST "${SUPABASE_URL}/functions/v1/fetch-multiple-photos-simple" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -H "apikey: ${ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "specificBars": ["Il-Fortizza", "Zion Bar & Restaurant"]
  }' | python3 -m json.tool

echo ""
echo "✨ Done!" 