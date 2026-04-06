#!/bin/bash

# Discord Spotify Music Bot - Debian 12+ Installation Script
# This script installs the bot on Debian 12+ for VPS deployment

set -e

echo "🚀 Discord Spotify Music Bot - Debian 12+ Installer"
echo "=================================================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ This script must be run as root. Use: sudo ./install-debian12.sh"
    exit 1
fi

# Update system packages
echo "📦 Updating system packages..."
apt-get update
apt-get upgrade -y

# Install Node.js 20
echo "📦 Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install ffmpeg
echo "📦 Installing ffmpeg..."
apt-get install -y ffmpeg

# Install build essentials and Python (required for some dependencies)
echo "📦 Installing build essentials..."
apt-get install -y build-essential python3 git

# Create bot directory
BOT_DIR="/opt/discord-music-bot"
echo "📁 Creating bot directory: $BOT_DIR"

if [ -d "$BOT_DIR" ]; then
    echo "⚠️ Bot directory already exists. Updating..."
    cd "$BOT_DIR"
    git pull origin main || git pull origin master
else
    echo "📥 Cloning repository..."
    git clone https://github.com/your-username/discord-music-bot.git "$BOT_DIR"
    cd "$BOT_DIR"
fi

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f "$BOT_DIR/.env" ]; then
    echo "⚙️ Creating .env file..."
    cp .env.example .env
    
    echo ""
    echo "⚠️ IMPORTANT: Edit the .env file with your credentials:"
    echo "   nano $BOT_DIR/.env"
    echo ""
    echo "Required environment variables:"
    echo "  - DISCORD_TOKEN: Your Discord bot token"
    echo "  - DISCORD_CLIENT_ID: Your bot's client ID"
    echo "  - ADMIN_USER_ID: Your Discord user ID (who can use the bot)"
    echo "  - SPOTIFY_CLIENT_ID: Your Spotify app client ID"
    echo "  - SPOTIFY_CLIENT_SECRET: Your Spotify app client secret"
    echo ""
fi

# Create systemd service file
echo "🔧 Creating systemd service..."
cat > /etc/systemd/system/discord-music-bot.service <<EOF
[Unit]
Description=Discord Spotify Music Bot
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$BOT_DIR
ExecStart=/usr/bin/node $BOT_DIR/src/index.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=discord-bot

# Environment
Environment="NODE_ENV=production"

[Install]
WantedBy=multi-user.target
EOF

# Set permissions
chmod 755 "$BOT_DIR"
chmod 644 /etc/systemd/system/discord-music-bot.service

# Reload systemd daemon
echo "🔄 Reloading systemd..."
systemctl daemon-reload

echo ""
echo "✅ Installation complete!"
echo ""
echo "📝 Next steps:"
echo "1. Edit .env file: nano $BOT_DIR/.env"
echo "2. Start the bot: systemctl start discord-music-bot"
echo "3. Enable auto-start: systemctl enable discord-music-bot"
echo "4. Check status: systemctl status discord-music-bot"
echo "5. View logs: journalctl -u discord-music-bot -f"
echo ""
echo "🎵 Bot will now run 24/7 and restart automatically on failure!"
