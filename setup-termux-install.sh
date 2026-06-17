#!/bin/bash
# 🎯 ALL-IN-ONE SETUP WHATSAPP BOT DI TERMUX
# Jalan di Termux setelah download bot-wa.zip

set -e  # Stop on error

echo "🚀 SETUP WHATSAPP BOT DI TERMUX"
echo "====================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Check if bot-wa.zip exists
if [ ! -f "bot-wa.zip" ]; then
    print_error "bot-wa.zip tidak ditemukan!"
    echo ""
    echo "📋 CARA DOWNLOAD:"
    echo "1. Upload bot-wa.zip ke Google Drive dari Mac"
    echo "2. Buka Google Drive di HP Android"
    echo "3. Download bot-wa.zip"
    echo "4. Pindahkan ke folder Termux (biasanya /sdcard/Download)"
    echo "5. Jalankan di Termux:"
    echo "   cp /sdcard/Download/bot-wa.zip ~/bot-wa.zip"
    echo "   cd ~"
    echo "   bash setup-termux-install.sh"
    exit 1
fi

print_success "bot-wa.zip ditemukan!"

# STEP 1: Update & Upgrade Termux
echo ""
print_info "Step 1/9: Updating Termux packages..."
pkg update -y && pkg upgrade -y
print_success "Termux updated!"

# STEP 2: Install Dependencies
echo ""
print_info "Step 2/9: Installing dependencies..."
pkg install -y git nodejs python termux-services tmux curl
print_success "Dependencies installed!"

# Verify Node.js version
NODE_VERSION=$(node --version)
print_info "Node.js version: $NODE_VERSION"

# STEP 3: Setup Storage Permissions
echo ""
print_info "Step 3/9: Setting up storage permissions..."
termux-setup-storage
print_success "Storage permissions granted!"

# STEP 4: Extract Project
echo ""
print_info "Step 4/9: Extracting bot-wa.zip..."
unzip -o bot-wa.zip -d ~/bot-wa
cd ~/bot-wa
print_success "Project extracted to ~/bot-wa!"

# STEP 5: Install NPM Packages
echo ""
print_info "Step 5/9: Installing npm packages..."
npm install
print_success "NPM packages installed!"

# STEP 6: Build TypeScript
echo ""
print_info "Step 6/9: Building TypeScript..."
npm run build
print_success "TypeScript built!"

# STEP 7: Create Required Directories
echo ""
print_info "Step 7/9: Creating required directories..."
mkdir -p ~/bot-wa/auth_info_baileys
mkdir -p ~/bot-wa/state
mkdir -p ~/bot-wa/public
print_success "Directories created!"

# STEP 8: Setup Background Service
echo ""
print_info "Step 8/9: Setting up background service..."

# Create startup script
cat > ~/bot-wa/start-bot.sh << 'EOF'
#!/bin/bash
cd ~/bot-wa
npm start
EOF

chmod +x ~/bot-wa/start-bot.sh

# Setup tmux session
cat > ~/bot-wa/start-bot-tmux.sh << 'EOF'
#!/bin/bash
# Kill existing session if exists
tmux kill-session -t bot-session 2>/dev/null || true

# Create new session and run bot
tmux new-session -d -s bot-session -c ~/bot-wa "npm start"

echo "✅ Bot running in tmux session 'bot-session'"
echo "📱 Attach: tmux attach -t bot-session"
echo "📱 Detach: Ctrl+B, then D"
echo "📱 Stop: tmux kill-session -t bot-session"
EOF

chmod +x ~/bot-wa/start-bot-tmux.sh

print_success "Background service configured!"

# STEP 9: Create Auto-Start Script
echo ""
print_info "Step 9/9: Creating auto-start script..."

# Create Termux:Boot script
mkdir -p ~/.termux-boot
cat > ~/.termux-boot/start-bot.sh << 'EOF'
#!/data/data/com.termux/files/usr/bin/sh
cd ~/bot-wa
tmux new-session -d -s bot-session "npm start"
EOF

chmod +x ~/.termux-boot/start-bot.sh

print_success "Auto-start script created!"

# FINAL SUMMARY
echo ""
echo "====================================="
echo -e "${GREEN}🎉 SETUP SELESAI!${NC}"
echo "====================================="
echo ""
echo "📋 NEXT STEPS:"
echo ""
echo "1️⃣  Jalankan bot:"
echo "   cd ~/bot-wa"
echo "   bash start-bot-tmux.sh"
echo ""
echo "2️⃣  Scan QR code:"
echo "   • QR akan muncul di terminal"
echo "   • Screenshot QR dari terminal"
echo "   • Kirim screenshot ke HP lain"
echo "   • Scan QR dengan WhatsApp di HP lain"
echo ""
echo "3️⃣  Monitoring:"
echo "   • Attach session: tmux attach -t bot-session"
echo "   • Detach: Ctrl+B, then D"
echo "   • Check logs: tail -f bot.log"
echo ""
echo "4️⃣  Auto-start on boot:"
echo "   • Install Termux:Boot:"
echo "     pkg install termux-boot"
echo "   • Grant autostart permission di Android settings"
echo "   • Reboot HP untuk test auto-start"
echo ""
echo "⚠️  IMPORTANT:"
echo "   • HP harus selalu ON + connect internet"
echo "   • Termux tidak boleh di-clear from recent apps"
echo "   • Use 'Keep Screen On' saat charging"
echo ""
echo "====================================="

# Ask to start bot now
echo ""
read -p "Mulai bot sekarang? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    print_info "Starting bot in tmux session..."
    bash ~/bot-wa/start-bot-tmux.sh
    sleep 2
    echo ""
    print_success "Bot started!"
    echo ""
    echo "Attach ke session untuk melihat QR code:"
    echo "  tmux attach -t bot-session"
else
    print_info "Bot tidak dijalankan. Jalankan manual:"
    echo "  cd ~/bot-wa"
    echo "  bash start-bot-tmux.sh"
fi

echo ""
print_success "Done! Script completed successfully."
