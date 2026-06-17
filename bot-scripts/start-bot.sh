#!/bin/bash
# Start WhatsApp Bot in tmux session

cd ~/bot-wa

# Check if already running
if tmux list-sessions 2>/dev/null | grep -q "bot-session"; then
    echo "⚠️  Bot already running in session 'bot-session'"
    echo "   Attach: tmux attach -t bot-session"
    echo "   Stop first: ./stop-bot.sh"
    exit 1
fi

# Start bot in new tmux session
tmux new-session -d -s bot-session -c ~/bot-wa "npm start"

echo "✅ Bot started in tmux session 'bot-session'"
echo ""
echo "📱 Commands:"
echo "   Attach: tmux attach -t bot-session"
echo "   Detach: Ctrl+B, then D"
echo "   Stop: ./stop-bot.sh"
echo "   Logs: ./logs-bot.sh"
echo "   Status: ./status-bot.sh"
