#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Checking Cursor Reviews...${NC}\n"

# Check for recent Cursor commits
echo -e "${GREEN}Recent Cursor Automated Commits:${NC}"
git log --grep="🤖 \[Cursor\]" -n 5 --pretty=format:"%h - %s (%cr)" --abbrev-commit
echo -e "\n"

# Check Cursor review logs
if [ -f ".cursor/cursor.log" ]; then
    echo -e "${GREEN}Recent Review Logs:${NC}"
    tail -n 20 .cursor/cursor.log
else
    echo "No review logs found."
fi

# Check review reports
if [ -d ".cursor/reviews" ]; then
    echo -e "\n${GREEN}Available Review Reports:${NC}"
    ls -lt .cursor/reviews
else
    echo "No review reports found."
fi 