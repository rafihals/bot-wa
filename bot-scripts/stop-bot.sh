#!/bin/bash
# Stop WhatsApp Bot

cd ~/bot-wa

if tmux list-sessions 2>/dev/null | grep -q "bot-session"; then
    echo "🛑 Stopping bot..."
    tmux kill-session -t bot-session
    echo "✅ Bot stopped!"
else
    echo "⚠️  Bot is not running"
fi
