#!/bin/bash
# Restart WhatsApp Bot

cd ~/bot-wa

echo "🔄 Restarting bot..."
echo ""

# Stop if running
if tmux list-sessions 2>/dev/null | grep -q "bot-session"; then
    echo "1️⃣  Stopping bot..."
    tmux kill-session -t bot-session
    sleep 2
    echo "   ✅ Bot stopped"
else
    echo "1️⃣  Bot not running"
fi

echo ""
echo "2️⃣  Starting bot..."
tmux new-session -d -s bot-session -c ~/bot-wa "npm start"
sleep 2

echo "   ✅ Bot started!"
echo ""
echo "📱 Attach to session:"
echo "   tmux attach -t bot-session"
