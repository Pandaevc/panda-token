#!/bin/bash
cd /Users/gaodelong/.openclaw/workspace/stock-project
python3 daily-pick.py

# Read the result and send to Boss
if [ -f daily-picks.json ]; then
    echo "Stock picks generated"
fi
