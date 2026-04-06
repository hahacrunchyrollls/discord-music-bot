#!/bin/bash

# Discord Spotify Music Bot - Debian 12+ Installation Script
# This script installs the bot on Debian 12+ for VPS deployment
# Usage: sudo ./install-debian12.sh [install|uninstall]

set -e

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ This script must be run as root. Use: sudo ./install-debian12.sh"
    exit 1
fi

# Uninstaller function
uninstall_bot() {
    echo "🗑️ Discord Spotify Music Bot - Uninstaller"
    echo "==========================================="
    echo ""
    echo "⚠️ This will remove the Discord Music Bot from your system."
    read -p "Are you sure? (yes/no): " confirm
    
    if [ "$confirm" != "yes" ]; then
        echo "❌ Uninstall cancelled."
        exit 0
    fi
    
    BOT_DIR="/opt/discord-music-bot"
    
    # Stop the service
    echo "⏹️ Stopping bot service..."
    systemctl stop discord-music-bot 2>/dev/null || true
    
    # Disable auto-start
    echo "🔌 Disabling auto-start..."
    systemctl disable discord-music-bot 2>/dev/null || true
    
    # Remove systemd service
    echo "🔧 Removing systemd service..."
    rm -f /etc/systemd/system/discord-music-bot.service
    systemctl daemon-reload
    
    # Remove bot directory
    echo "📁 Removing bot directory..."
    rm -rf "$BOT_DIR"
    
    # Remove .env backup if exists
    echo "📄 Cleaning up backup files..."
    rm -f /etc/discord-music-bot/.env 2>/dev/null || true
    rm -rf /etc/discord-music-bot 2>/dev/null || true
    
    echo ""
    echo "✅ Uninstallation complete!"
    echo "Bot and all files have been removed."
    exit 0
}

# Prompt for environment variables
prompt_env_variables() {
    echo ""
    echo "🔐 Discord Bot Configuration"
    echo "=============================="
    
    # DISCORD_TOKEN
    while [ -z "$DISCORD_TOKEN" ]; do
        read -sp "Enter DISCORD_TOKEN (hidden input): " DISCORD_TOKEN
        echo ""
        if [ -z "$DISCORD_TOKEN" ]; then
            echo "❌ DISCORD_TOKEN cannot be empty!"
        fi
    done
    
    # DISCORD_CLIENT_ID
    while [ -z "$DISCORD_CLIENT_ID" ]; do
        read -p "Enter DISCORD_CLIENT_ID: " DISCORD_CLIENT_ID
        if [ -z "$DISCORD_CLIENT_ID" ]; then
            echo "❌ DISCORD_CLIENT_ID cannot be empty!"
        fi
    done
    
    # ADMIN_USER_ID
    while [ -z "$ADMIN_USER_ID" ]; do
        read -p "Enter ADMIN_USER_ID (your Discord user ID): " ADMIN_USER_ID
        if [ -z "$ADMIN_USER_ID" ]; then
            echo "❌ ADMIN_USER_ID cannot be empty!"
        fi
    done
    
    # SPOTIFY_CLIENT_ID (optional)
    read -p "Enter SPOTIFY_CLIENT_ID (optional, press Enter to skip): " SPOTIFY_CLIENT_ID
    
    # SPOTIFY_CLIENT_SECRET (optional)
    if [ -n "$SPOTIFY_CLIENT_ID" ]; then
        read -sp "Enter SPOTIFY_CLIENT_SECRET (hidden input, optional, press Enter to skip): " SPOTIFY_CLIENT_SECRET
        echo ""
    fi
    
    echo ""
    echo "✅ Configuration received!"
}

# Check for uninstall command
if [ "$1" = "uninstall" ]; then
    uninstall_bot
fi

echo "🚀 Discord Spotify Music Bot - Debian 12+ Installer"
echo "=================================================="
echo ""

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
    git clone https://github.com/hahacrunchyrollls/discord-music-bot.git "$BOT_DIR"
    cd "$BOT_DIR"
fi

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Prompt for environment variables
prompt_env_variables

# Create .env file with user input
echo "⚙️ Creating .env file with your credentials..."
cat > "$BOT_DIR/.env" <<ENV_FILE
DISCORD_TOKEN=$DISCORD_TOKEN
DISCORD_CLIENT_ID=$DISCORD_CLIENT_ID
ADMIN_USER_ID=$ADMIN_USER_ID
SPOTIFY_CLIENT_ID=$SPOTIFY_CLIENT_ID
SPOTIFY_CLIENT_SECRET=$SPOTIFY_CLIENT_SECRET
ENV_FILE

# Restrict .env file permissions for security
chmod 600 "$BOT_DIR/.env"
echo "✅ .env file created with restricted permissions (600)"
echo ""

# Create systemd service file
echo "🔧 Creating systemd service..."
cat > /etc/systemd/system/   <<EOF
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
systemctl enable discord-music-bot
systemctl restart discord-music-bot

echo ""
echo "✅ Installation complete!"
echo ""
echo "📝 Next steps:"
echo "1. Start the bot: systemctl start discord-music-bot"
echo "2. Enable auto-start: systemctl enable discord-music-bot"
echo "3. Check status: systemctl status discord-music-bot"
echo "4. View logs: journalctl -u discord-music-bot -f"
echo ""
echo "🎵 Bot will now run 24/7 and restart automatically on failure!"
echo ""
echo "📔 Bot configuration (.env) is stored at: $BOT_DIR/.env"
echo ""
echo "🗑️ To uninstall the bot, run:"
echo "   sudo $0 uninstall"
echo ""
