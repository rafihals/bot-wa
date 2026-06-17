#!/bin/bash
# View WhatsApp Bot Logs

cd ~/bot-wa

echo "📋 BOT LOGS (last 50 lines)"
echo "=========================="
echo ""

if [ -f "bot.log" ]; then
    tail -n 50 bot.log
    echo ""
    echo "📱 Follow logs (Ctrl+C to exit):"
    echo "   tail -f bot.log"
else
    echo "⚠️  No log file found"
    echo ""
    echo "Bot mungkin jalan di tmux session. Cek langsung:"
    echo "   tmux attach -t bot-session"
fi
