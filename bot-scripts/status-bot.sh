#!/bin/bash
# Check WhatsApp Bot Status

cd ~/bot-wa

echo "📊 BOT STATUS"
echo "=============="
echo ""

# Check if tmux session exists
if tmux list-sessions 2>/dev/null | grep -q "bot-session"; then
    echo "Status: ✅ RUNNING"
    echo "Session: bot-session"
    echo ""

    # Check if Node.js process is active
    if pgrep -f "npm start" > /dev/null; then
        echo "Process: ✅ Active"
        echo "PID: $(pgrep -f 'npm start')"
    else
        echo "Process: ⚠️  Not active"
    fi

    echo ""
    echo "📱 Attach to session:"
    echo "   tmux attach -t bot-session"
else
    echo "Status: ❌ NOT RUNNING"
    echo ""
    echo "Start bot:"
    echo "   ./start-bot.sh"
fi

echo ""
echo "📁 Storage Check:"
echo "   Auth: $(ls -la auth_info_baileys/ 2>/dev/null | wc -l) files"
echo "   State: $(ls -la state/ 2>/dev/null | wc -l) files"

echo ""
echo "📱 Authenticated:"
if [ -d "auth_info_baileys" ] && [ "$(ls -A auth_info_baileys)" ]; then
    echo "   ✅ Yes (session exists)"
else
    echo "   ❌ No (need to scan QR)"
fi
