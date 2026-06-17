# 🎯 TERMUX SETUP GUIDE - ALL-IN-ONE

## 📱 Persiapan di Mac

### Step 1: Transfer Project ke HP

```bash
cd ~/Development/freelance/bot-wa

# Jalankan script untuk zip project
./setup-termux.sh

# Upload bot-wa.zip ke Google Drive
```

### Step 2: Di HP Android

1. **Download Termux dari F-Droid** (bukan Play Store!)
2. **Download bot-wa.zip dari Google Drive**
3. **Pindahkan bot-wa.zip ke folder Termux**:
   - Buka File Manager di HP
   - Cari file bot-wa.zip (biasanya di Downloads)
   - Cut/Copy file
   - Paste ke folder: `/storage/emulated/0/Download/`
   - Atau langsung di Termux: `cp /sdcard/Download/bot-wa.zip ~/bot-wa.zip`

---

## 🚀 Setup Otomatis di Termux

### Step 1: Download Script Setup

```bash
# Di Termux, pindahkan bot-wa.zip ke home directory
cp /sdcard/Download/bot-wa.zip ~/bot-wa.zip

# Atau jika sudah download langsung ke Termux:
cd ~
ls -la bot-wa.zip
```

### Step 2: Jalankan Setup Script

```bash
cd ~
bash setup-termux-install.sh
```

**Script akan otomatis:**
- ✅ Update & upgrade Termux
- ✅ Install semua dependencies (git, nodejs, python, tmux, termux-services)
- ✅ Setup storage permissions
- ✅ Extract bot-wa.zip
- ✅ Install npm packages
- ✅ Build TypeScript
- ✅ Setup background service
- ✅ Create utility scripts
- ✅ Configure auto-start on boot

### Step 3: Setup akan menanyakan:

```
Mulai bot sekarang? (y/n):
```

- Pilih **y** untuk langsung jalankan bot
- Atau pilih **n** untuk jalankan manual nanti

---

## 📱 Menggunakan Bot

### Start Bot

```bash
cd ~/bot-wa
./start-bot.sh
```

### Scan QR Code (First Time Only)

```bash
./qr-helper.sh
```

Pilih cara scan QR:
- **Cara 1**: Screenshot dari terminal (recommended)
- **Cara 2**: Forward via Ngrok
- **Cara 3**: Buka di localhost browser

### Monitoring Bot

```bash
# Cek status
./status-bot.sh

# Lihat logs
./logs-bot.sh

# Attach ke session (lihat langsung di terminal)
tmux attach -t bot-session

# Detach dari session (Ctrl+B, then D)
```

### Stop Bot

```bash
./stop-bot.sh
```

### Restart Bot

```bash
./restart-bot.sh
```

---

## 🔧 Utility Scripts Tersedia

Setelah setup selesai, kamu punya 6 utility scripts di `~/bot-wa/`:

| Script | Fungsi |
|--------|--------|
| `./start-bot.sh` | Jalankan bot di background (tmux) |
| `./stop-bot.sh` | Stop bot |
| `./status-bot.sh` | Cek status bot |
| `./logs-bot.sh` | Lihat logs terakhir |
| `./restart-bot.sh` | Restart bot |
| `./qr-helper.sh` | Helper untuk scan QR code |

---

## 📂 Struktur Project di Termux

```
~/bot-wa/
├── bot-scripts/           # Utility scripts
├── src/                   # Source code
├── auth_info_baileys/     # WhatsApp auth (persistent)
├── state/                 # User sessions (persistent)
├── public/                # QR code & web assets
├── node_modules/          # NPM packages
├── bot.log                # Bot logs
├── start-bot.sh          # Start script
├── stop-bot.sh           # Stop script
├── status-bot.sh         # Status script
├── logs-bot.sh           # Logs script
├── restart-bot.sh        # Restart script
└── qr-helper.sh          # QR helper
```

---

## ⚠️ Important Notes

### HP Requirements

- ✅ HP harus selalu ON (tidak sleep)
- ✅ Koneksi internet stabil (WiFi atau mobile data)
- ✅ Termux tidak boleh di-clear dari recent apps
- ✅ Storage tidak penuh

### Power Management

Agar HP tidak sleep:

**Cara 1: Android Settings**
```
Settings → Display → Sleep → "Never" (saat charging)
```

**Cara 2: Termux Wake Lock**
```bash
pkg install termux-api
termux-wakelock acquire
```

**Cara 3: Aplikasi Pihak Ketiga**
- Download "Caffeinate" dari Play Store
- Setting: Keep screen on saat charging

### Auto-Start on Boot

```bash
# Install Termux:Boot
pkg install termux-boot

# Script auto-start sudah dibuat di ~/.termux-boot/start-bot.sh

# Grant permission di Android Settings:
Settings → Apps → Termux:Boot → Allow autostart

# Reboot HP untuk test
```

---

## 🐛 Troubleshooting

### Bot tidak merespon pesan

```bash
# 1. Cek status
./status-bot.sh

# 2. Cek logs
./logs-bot.sh

# 3. Restart bot
./restart-bot.sh

# 4. Attach ke session untuk lihat error langsung
tmux attach -t bot-session
```

### QR code tidak muncul

```bash
# Hapus auth data lama
rm -rf ~/bot-wa/auth_info_baileys/*

# Restart bot
./restart-bot.sh

# Attach ke session untuk scan QR
tmux attach -t bot-session
```

### Termux crash/force close

```bash
# Bot sudah jalan di background tmux session
# Cek apakah session masih ada:
tmux list-sessions

# Attach kembali:
tmux attach -t bot-session
```

### Storage penuh

```bash
# Cleanup old sessions
rm -rf ~/bot-wa/state/*

# Cleanup logs
> ~/bot-wa/bot.log

# Cek space
df -h
```

---

## 📊 Monitoring Production

### Cek Bot Health

```bash
# Script untuk cek bot health
cat > ~/bot-wa/health-check.sh << 'EOF'
#!/bin/bash

echo "🏥 BOT HEALTH CHECK"
echo "===================="
echo ""

# Check tmux session
if tmux list-sessions 2>/dev/null | grep -q "bot-session"; then
    echo "✅ Bot session: ACTIVE"
else
    echo "❌ Bot session: INACTIVE"
fi

# Check Node.js process
if pgrep -f "npm start" > /dev/null; then
    echo "✅ Node process: RUNNING (PID: $(pgrep -f 'npm start'))"
else
    echo "❌ Node process: NOT RUNNING"
fi

# Check auth
if [ -d "~/bot-wa/auth_info_baileys" ] && [ "$(ls -A ~/bot-wa/auth_info_baileys)" ]; then
    echo "✅ WhatsApp auth: PAIRED"
else
    echo "❌ WhatsApp auth: NOT PAIRED"
fi

# Check storage
STORAGE_USED=$(du -sh ~/bot-wa/state/ | cut -f1)
echo "📁 Storage used: $STORAGE_USED"

# Check uptime
if pgrep -f "npm start" > /dev/null; then
    UPTIME=$(ps -o etime= -p $(pgrep -f 'npm start') | tr -d ' ')
    echo "⏱️  Uptime: $UPTIME"
fi

echo ""
echo "===================="
EOF

chmod +x ~/bot-wa/health-check.sh
```

Jalankan health check:
```bash
~/bot-wa/health-check.sh
```

---

## 🎉 Setup Selesai!

Bot WhatsApp kamu sekarang siap jalan 24/7 di Termux!

**Next Steps:**
1. ✅ Test bot dengan kirim pesan ke WhatsApp bot
2. ✅ Setup auto-start on boot
3. ✅ Setup monitoring (health check)
4. ✅ Ensure HP selalu ON + internet

**Happy Botting! 🤖**
