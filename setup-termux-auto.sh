#!/bin/bash
# 🎯 AUTO SETUP - Download dari GitHub, TANPA ZIP/UNZIP
# Jalan langsung di Termux: bash <(curl -s URL) atau bash setup-termux-auto.sh

set -e

echo "🚀 WHATSAPP BOT AUTO SETUP (NO ZIP NEEDED)"
echo "========================================"
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if folder already exists
if [ -d "~/bot-wa" ]; then
    print_info "Folder ~/bot-wa already exists!"
    read -p "Delete and reinstall? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Removing existing folder..."
        rm -rf ~/bot-wa
    else
        print_error "Setup cancelled. Folder already exists."
        exit 1
    fi
fi

# Update Termux
print_info "Step 1/7: Updating Termux..."
pkg update -y && pkg upgrade -y
print_success "Termux updated!"

# Install dependencies
print_info "Step 2/7: Installing dependencies..."
pkg install -y git nodejs python wget curl unzip tmux termux-services 2>/dev/null
print_success "Dependencies installed!"

# Setup storage
print_info "Step 3/7: Setting up storage..."
termux-setup-storage
print_success "Storage configured!"

# Download project dari GitHub langsung (TANPA ZIP)
print_info "Step 4/7: Downloading project from GitHub..."
cd ~

# Clone langsung dari GitHub (TANPA ZIP/UNZIP)
if [ -d "bot-wa" ]; then
    print_info "Project folder exists, pulling latest changes..."
    cd ~/bot-wa
    git pull origin main
else
    print_info "Cloning project from GitHub..."
    git clone https://github.com/rafihals/bot-wa.git
    cd ~/bot-wa
fi

print_success "Project downloaded!"

# Install npm packages
print_info "Step 5/7: Installing npm packages..."
npm install
print_success "NPM packages installed!"

# Build TypeScript
print_info "Step 6/7: Building TypeScript..."
npm run build
print_success "TypeScript built!"

# Create directories
print_info "Step 7/7: Creating required directories..."
mkdir -p ~/bot-wa/auth_info_baileys
mkdir -p ~/bot-wa/state
mkdir -p ~/bot-wa/public
print_success "Directories created!"

# Setup utility scripts
print_info "Setting up bot management scripts..."

# Make scripts executable
chmod +x ~/bot-wa/bot-scripts/*.sh

print_success "Bot scripts configured!"

# Setup tmux startup script
cat > ~/bot-wa/start-bot-tmux.sh << 'EOF'
#!/bin/bash
cd ~/bot-wa
tmux kill-session -t bot-session 2>/dev/null || true
tmux new-session -d -s bot-session "npm start"
echo "✅ Bot started in tmux session 'bot-session'"
echo "📱 Attach: tmux attach -t bot-session"
echo "📱 Detach: Ctrl+B, then D"
echo "📱 Stop: tmux kill-session -t bot-session"
EOF

chmod +x ~/bot-wa/start-bot-tmux.sh

# Setup auto-start on boot
mkdir -p ~/.termux-boot
cat > ~/.termux-boot/start-bot.sh << 'EOF'
#!/data/data/com.termux/files/usr/bin/sh
cd ~/bot-wa
tmux new-session -d -s bot-session "npm start"
EOF

chmod +x ~/.termux-boot/start-bot.sh

print_success "Auto-start configured!"

# Final summary
echo ""
echo "========================================"
echo -e "${GREEN}🎉 SETUP SELESAI!${NC}"
echo "========================================"
echo ""
echo "📋 NEXT STEPS:"
echo ""
echo "1️⃣  Start bot:"
echo "   cd ~/bot-wa"
echo "   bash start-bot-tmux.sh"
echo ""
echo "2️⃣  Scan QR code (first time only):"
echo "   • QR akan muncul di terminal"
echo "   • Screenshot QR code"
echo "   • Scan dengan WhatsApp"
echo ""
echo "3️⃣  Management commands:"
echo "   cd ~/bot-wa"
echo "   bash bot-scripts/start-bot.sh      # Start bot"
echo "   bash bot-scripts/stop-bot.sh        # Stop bot"
echo "   bash bot-scripts/restart-bot.sh     # Restart bot"
echo "   bash bot-scripts/status-bot.sh      # Check status"
echo "   bash bot-scripts/logs-bot.sh        # View logs"
echo ""
echo "⚠️  IMPORTANT:"
echo "   • HP harus selalu ON + internet"
echo "   • Termux tidak boleh di-clear dari recent apps"
echo ""

read -p "Mulai bot sekarang? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    print_info "Starting bot..."
    bash ~/bot-wa/start-bot-tmux.sh
    sleep 2
    echo ""
    print_success "Bot started! Attach ke session:"
    echo "   tmux attach -t bot-session"
else
    print_info "Bot tidak dijalankan. Start manual:"
    echo "   cd ~/bot-wa"
    echo "   bash start-bot-tmux.sh"
fi

echo ""
print_success "Setup completed successfully!"
