#!/bin/bash
# QR Code Helper untuk WhatsApp Bot

cd ~/bot-wa

echo "📱 QR CODE HELPER"
echo "================="
echo ""
echo "Ada 3 cara untuk scan QR code:"
echo ""

echo "📋 CARA 1: Screenshot dari Terminal (Recommended)"
echo "   1. Pastikan bot running: ./start-bot.sh"
echo "   2. Attach ke session: tmux attach -t bot-session"
echo "   3. QR code akan muncul di terminal"
echo "   4. Screenshot QR dari terminal"
echo "   5. Kirim screenshot ke HP lain/laptop"
echo "   6. Scan screenshot dengan WhatsApp"
echo ""

echo "📋 CARA 2: Forward QR via Ngrok"
echo "   1. Install ngrok di Termux:"
echo "      curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | \
              tee /data/data/com.termux/files/home/ngrok.asc"
echo "      curl -s https://ngrok-agent.s3.amazonaws.com/ngrok-installer.sh | \
              bash"
echo "   2. Start bot: ./start-bot.sh"
echo "   3. Jalankan ngrok:"
echo "      ngrok http 3000"
echo "   4. Buka URL ngrok di browser"
echo "   5. Scan QR dari browser"
echo ""

echo "📋 CARA 3: View dari localhost (dalam Termux)"
echo "   1. Pastikan bot running"
echo "   2. Install browser di Termux:"
echo "      pkg install termux-api"
echo "   3. Buka QR di browser:"
echo "      termux-open-url http://localhost:3000/qr"
echo "   4. Scan QR dari browser Termux"
echo ""

echo "⚠️  CATATAN PENTING:"
echo "   • QR hanya muncul saat FIRST TIME pairing"
echo "   • Setelah scan, QR tidak akan muncul lagi"
echo "   • Auth data tersimpan di auth_info_baileys/"
echo "   • Jika ingin re-scan, hapus folder: rm -rf auth_info_baileys/*"
echo ""

read -p "Pilih cara (1/2/3): " choice

case $choice in
    1)
        echo ""
        echo "📱 Menggunakan Cara 1..."
        if tmux list-sessions 2>/dev/null | grep -q "bot-session"; then
            echo "✅ Bot running. Attach ke session untuk melihat QR:"
            echo "   tmux attach -t bot-session"
        else
            echo "❌ Bot belum running. Start dulu:"
            echo "   ./start-bot.sh"
            echo "   tmux attach -t bot-session"
        fi
        ;;
    2)
        echo ""
        echo "📱 Menggunakan Cara 2 (Ngrok)..."
        echo "Install ngrok dulu (y/n)?"
        read -p "> " install_ngrok
        if [ "$install_ngrok" = "y" ]; then
            pkg install -y curl
            curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | \
                tee ~/ngrok.asc
            echo "✅ Ngrok installed!"
            echo "Jalankan: ngrok http 3000"
        fi
        ;;
    3)
        echo ""
        echo "📱 Menggunakan Cara 3 (Localhost)..."
        pkg install -y termux-api
        if tmux list-sessions 2>/dev/null | grep -q "bot-session"; then
            echo "✅ Bot running. Membuka QR di browser..."
            termux-open-url http://localhost:3000/qr
        else
            echo "❌ Bot belum running. Start dulu:"
            echo "   ./start-bot.sh"
        fi
        ;;
    *)
        echo "❌ Invalid choice"
        ;;
esac
