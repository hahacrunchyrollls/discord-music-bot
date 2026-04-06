# 🎵 Discord Spotify Music Bot

A Discord bot that plays music with Spotify integration, admin-only access, and 24/7 uptime support. The bot can stay AFK in voice channels indefinitely using silent audio without being kicked.

## ✨ Features

- 🎵 **Spotify Integration**: Play tracks directly from Spotify URLs
- 🎮 **YouTube Support**: Play any YouTube video via search or URL
- 👤 **Admin-Only Access**: Only specified admin user can use the bot
- 🔇 **Silent AFK Mode**: Stay in voice channels 24/7 with silent audio playback
- ⏰ **24/7 Uptime**: Auto-reconnect capability with systemd for VPS deployment
- 🔌 **Graceful Shutdown**: Properly handles termination signals
- 🌐 **Web Hosting & VPS Ready**: Works on Debian 12+ servers

## 🚀 Quick Start

### Prerequisites

- **Discord Bot Token** - Create at [Discord Developer Portal](https://discord.com/developers/applications)
- **Spotify Credentials** (Optional) - Create at [Spotify Developer Dashboard](https://developer.spotify.com)
- **Node.js 18+** (for local development)
- **ffmpeg** (for audio processing)

### Local Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd discord-music-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   nano .env
   ```

4. **Start the bot**
   ```bash
   npm start
   ```

## 🖥️ VPS Deployment (Debian 12+)

### Automated Installation

```bash
sudo chmod +x install-debian12.sh
sudo ./install-debian12.sh
```

This script will:
- Install Node.js 20 and ffmpeg
- Clone the repository to `/opt/discord-music-bot`
- Create a systemd service for auto-start and monitoring
- Set up automatic restarts on failure

### Manual Configuration After Install

Edit the environment file:
```bash
sudo nano /opt/discord-music-bot/.env
```

### Service Management

```bash
# Start the bot
sudo systemctl start discord-music-bot

# Enable auto-start on reboot
sudo systemctl enable discord-music-bot

# Check status
sudo systemctl status discord-music-bot

# View logs
sudo journalctl -u discord-music-bot -f

# Stop the bot
sudo systemctl stop discord-music-bot

# Restart the bot
sudo systemctl restart discord-music-bot
```

## 🔑 Environment Variables

Create a `.env` file with the following:

```env
# Discord Bot
DISCORD_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_client_id_here
ADMIN_USER_ID=your_discord_user_id_here

# Spotify (Optional but recommended)
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
```

### Where to Find These Values

**DISCORD_TOKEN & DISCORD_CLIENT_ID:**
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create or select your application
3. Go to "Bot" section and click "Reset Token"
4. Copy the token to `DISCORD_TOKEN`
5. Go to "General Information" and copy Client ID to `DISCORD_CLIENT_ID`

**ADMIN_USER_ID:**
1. Enable Developer Mode in Discord (User Settings → Advanced → Developer Mode)
2. Right-click your username and select "Copy User ID"

**SPOTIFY_CLIENT_ID & SPOTIFY_CLIENT_SECRET:**
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new application
3. Accept the terms and create
4. Copy Client ID and Client Secret from your app settings

## 📝 Commands

All commands are admin-only and use Discord slash commands (`/`).

### 🎵 `/play [query]`
Play music from a query, YouTube URL, or Spotify URL.

```
/play https://open.spotify.com/track/...
/play Never Gonna Give You Up
/play https://www.youtube.com/watch?v=...
```

### 🔇 `/afk [channel]`
Join a voice channel and stay AFK with silent audio. The bot will never disconnect.

```
/afk general
/afk 1234567890
```

### ⏹️ `/stop`
Stop playing music and disconnect from the voice channel.

```
/stop
```

### 👋 `/leave`
Leave the voice channel.

```
/leave
```

### 🏓 `/ping`
Check bot latency and connection status.

```
/ping
```

## 🔒 Security

- ✅ **Admin-Only Access**: Only the user specified in `ADMIN_USER_ID` can use any commands
- ✅ **No Token Exposure**: Never commit `.env` file to version control
- ✅ **Environment-Based Configuration**: All sensitive data is environment-based

### .gitignore

Make sure `.env` is in your `.gitignore`:
```
.env
node_modules/
*.log
```

## 🛠️ Troubleshooting

### Bot doesn't respond to commands
- ✅ Check bot has permissions in the server
- ✅ Verify `DISCORD_TOKEN` and `DISCORD_CLIENT_ID` are correct
- ✅ Make sure your user ID matches `ADMIN_USER_ID`
- ✅ Ensure bot is online (check systemd status)

### Can't find Spotify tracks
- ✅ Verify `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` are correct
- ✅ Check Spotify API credentials are active in developer dashboard
- ✅ Try using YouTube URL instead as fallback

### Bot keeps disconnecting
- ✅ Check voice channel permissions
- ✅ Ensure ffmpeg is installed: `which ffmpeg`
- ✅ Review logs: `journalctl -u discord-music-bot -f`

### High CPU/Memory usage
- ✅ Check active connections: `/ping`
- ✅ Restart bot: `sudo systemctl restart discord-music-bot`
- ✅ Increase VPS resources if needed

## 📊 Monitoring

### View Real-Time Logs
```bash
sudo journalctl -u discord-music-bot -f
```

### Check Resource Usage
```bash
ps aux | grep "node src/index.js"
```

### Disk Space
```bash
df -h /opt/discord-music-bot
```

## 🔄 Updates

To update the bot on VPS:

```bash
cd /opt/discord-music-bot
git pull origin main
npm install
sudo systemctl restart discord-music-bot
```

## 📦 Installation on Other Platforms

### Windows
1. Install Node.js from [nodejs.org](https://nodejs.org)
2. Install ffmpeg from [ffmpeg.org](https://ffmpeg.org/download.html)
3. Clone repository and run `npm install && npm start`

### macOS
```bash
brew install node ffmpeg
npm install
npm start
```

## 🐳 Docker Deployment (Optional)

Create `Dockerfile`:
```dockerfile
FROM node:20-slim

RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .
RUN npm install

CMD ["node", "src/index.js"]
```

Build and run:
```bash
docker build -t discord-music-bot .
docker run -d --env-file .env discord-music-bot
```

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Support

For issues or feature requests, please create an issue in the repository.

---

**Made with ❤️ for Discord music lovers**
