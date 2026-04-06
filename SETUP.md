# 🔧 Setup Guide - Discord Spotify Music Bot

## Table of Contents
1. [Discord Developer Setup](#discord-developer-setup)
2. [Spotify API Setup](#spotify-api-setup)
3. [Local Development](#local-development)
4. [VPS Deployment (Debian 12+)](#vps-deployment)
5. [Docker Deployment](#docker-deployment)
6. [Configuration](#configuration)

---

## Discord Developer Setup

### Step 1: Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Enter a name (e.g., "Spotify Music Bot")
4. Click "Create"

### Step 2: Create Bot User

1. In your application, go to "Bot" section (left sidebar)
2. Click "Add Bot"
3. Under TOKEN section, click "Copy" to copy your bot token
4. **⚠️ IMPORTANT**: Keep this token secret! Never share it or commit to Git

### Step 3: Get Client ID

1. Go to "General Information" (left sidebar)
2. Copy your "Client ID"
3. Save both Token and Client ID for `.env` file

### Step 4: Set Bot Permissions

1. Go to "OAuth2" → "URL Generator"
2. Select scopes: `bot`
3. Select permissions:
   - ✅ Send Messages
   - ✅ Connect (join voice channels)
   - ✅ Speak (play audio)
   - ✅ Use Slash Commands

4. Copy the generated URL and open in browser
5. Select your Discord server and authorize

### Step 5: Get Your User ID

1. Open Discord
2. Go to User Settings → Advanced
3. Enable "Developer Mode"
4. Right-click your username → "Copy User ID"
5. This is your `ADMIN_USER_ID`

### Step 6: Invite Bot to Server

Use this URL format:
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=3147776&scope=bot%20applications.commands
```

Replace `YOUR_CLIENT_ID` with your actual client ID.

---

## Spotify API Setup

### Step 1: Create Spotify Application

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account (create one if needed)
3. Click "Create an App"
4. Enter app name (e.g., "Discord Music Bot")
5. Accept terms and create

### Step 2: Get Credentials

1. Click on your app
2. Copy **Client ID**
3. Copy or reset **Client Secret**
4. **⚠️ IMPORTANT**: Keep Client Secret private!

### Step 3: Accepted URIs (Optional)

If sharing your app:
1. Go to "Edit Settings"
2. Add Redirect URI: `http://localhost:3000/callback`
3. Save

---

## Local Development

### Prerequisites

- **Node.js 18+** - [Download](https://nodejs.org)
- **ffmpeg** - [Download](https://ffmpeg.org/download.html)
- **Git** - [Download](https://git-scm.com)

### macOS Setup

```bash
# Install with Homebrew
brew install node ffmpeg git

# Verify installations
node --version
ffmpeg -version
```

### Windows Setup

1. Download and install [Node.js](https://nodejs.org) (LTS recommended)
2. Download and install [ffmpeg](https://ffmpeg.org/download.html)
3. Download and install [Git](https://git-scm.com)
4. Add ffmpeg to system PATH if needed

### Linux (Ubuntu/Debian)

```bash
sudo apt-get update
sudo apt-get install -y nodejs npm ffmpeg
```

### Clone and Setup

```bash
# Clone repository
git clone <your-repo-url>
cd discord-music-bot

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit with your credentials
nano .env
# Or use your preferred editor
```

### .env Configuration for Local

```env
DISCORD_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_client_id_here
ADMIN_USER_ID=your_discord_user_id_here
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
```

### Run Locally

```bash
npm start
```

You should see:
```
✅ Bot logged in as YourBot#1234
✅ Commands registered for Your Server
```

---

## VPS Deployment (Debian 12+)

### Option 1: Automated Installation (Recommended)

1. **SSH into your VPS**
   ```bash
   ssh root@your_vps_ip
   ```

2. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd discord-music-bot
   ```

3. **Make installer executable and run**
   ```bash
   chmod +x install-debian12.sh
   sudo ./install-debian12.sh
   ```

4. **Edit configuration**
   ```bash
   sudo nano /opt/discord-music-bot/.env
   ```

5. **Start the bot**
   ```bash
   sudo systemctl start discord-music-bot
   sudo systemctl enable discord-music-bot
   ```

### Option 2: Manual Installation

1. **SSH into your VPS**
   ```bash
   ssh root@your_vps_ip
   ```

2. **Update system**
   ```bash
   apt-get update
   apt-get upgrade -y
   ```

3. **Install dependencies**
   ```bash
   # Node.js 20
   curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
   apt-get install -y nodejs

   # ffmpeg
   apt-get install -y ffmpeg

   # Build tools
   apt-get install -y build-essential python3 git
   ```

4. **Clone and setup bot**
   ```bash
   mkdir -p /opt/discord-music-bot
   git clone <your-repo-url> /opt/discord-music-bot
   cd /opt/discord-music-bot
   npm install
   cp .env.example .env
   ```

5. **Create systemd service**
   ```bash
   sudo nano /etc/systemd/system/discord-music-bot.service
   ```

   Paste this:
   ```ini
   [Unit]
   Description=Discord Spotify Music Bot
   After=network.target

   [Service]
   Type=simple
   User=root
   WorkingDirectory=/opt/discord-music-bot
   ExecStart=/usr/bin/node /opt/discord-music-bot/src/index.js
   Restart=always
   RestartSec=10
   StandardOutput=journal
   StandardError=journal

   [Install]
   WantedBy=multi-user.target
   ```

6. **Enable and start**
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable discord-music-bot
   sudo systemctl start discord-music-bot
   ```

### Service Management

```bash
# View status
sudo systemctl status discord-music-bot

# View logs (real-time)
sudo journalctl -u discord-music-bot -f

# View last 50 lines
sudo journalctl -u discord-music-bot -n 50

# Stop bot
sudo systemctl stop discord-music-bot

# Restart bot
sudo systemctl restart discord-music-bot

# Update bot
cd /opt/discord-music-bot
git pull
npm install
sudo systemctl restart discord-music-bot
```

---

## Docker Deployment

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Quick Start

1. **Clone repository**
   ```bash
   git clone <your-repo-url>
   cd discord-music-bot
   ```

2. **Create .env file**
   ```bash
   cp .env.example .env
   nano .env
   ```

3. **Build and run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **View logs**
   ```bash
   docker-compose logs -f
   ```

### Management Commands

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f discord-music-bot

# Restart
docker-compose restart

# Update and restart
git pull
docker-compose build --no-cache
docker-compose up -d
```

### Manual Docker Commands (if not using Compose)

```bash
# Build image
docker build -t discord-music-bot .

# Run container
docker run -d \
  --name discord-bot \
  --env-file .env \
  --restart always \
  discord-music-bot

# View logs
docker logs -f discord-bot

# Stop container
docker stop discord-bot

# Remove container
docker rm discord-bot
```

---

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DISCORD_TOKEN` | ✅ | Bot token from Discord Developer Portal |
| `DISCORD_CLIENT_ID` | ✅ | Client ID from Discord Developer Portal |
| `ADMIN_USER_ID` | ✅ | Your Discord User ID (only you can use bot) |
| `SPOTIFY_CLIENT_ID` | ❌ | Spotify app Client ID (optional, for Spotify URLs) |
| `SPOTIFY_CLIENT_SECRET` | ❌ | Spotify app Client Secret (optional, for Spotify URLs) |

### Security Best Practices

1. ✅ **Never commit .env** - It's in .gitignore
2. ✅ **Use strong tokens** - Don't reuse passwords
3. ✅ **Rotate credentials** - Regenerate if exposed
4. ✅ **Use environment variables** - Never hardcode secrets
5. ✅ **Limit bot permissions** - Only grant necessary scopes
6. ✅ **Monitor logs** - Check for unauthorized access attempts

---

## Troubleshooting

### Bot Won't Start

**Check Node.js version:**
```bash
node --version  # Should be 18+
```

**Check ffmpeg:**
```bash
which ffmpeg  # Should show path
ffmpeg -version  # Should show version
```

**Check .env file:**
```bash
cat .env  # All required variables present?
```

### Can't Connect to Discord

- Verify `DISCORD_TOKEN` is correct
- Check bot has internet connection
- Verify firewall allows outbound connections
- Check systemd logs: `sudo journalctl -u discord-music-bot -f`

### Spotify URLs Not Working

- Verify credentials are correct
- Check Spotify API dashboard for active status
- Try YouTube URL instead as fallback
- Review logs for specific error

### High CPU/Memory Usage

```bash
# Check process
ps aux | grep "node src"

# Monitor resources
top

# Restart to clear
sudo systemctl restart discord-music-bot
```

### Bot Disconnects Frequently

- Check voice channel permissions
- Ensure stable internet connection
- Review error logs
- Consider increasing VPS resources

---

## Next Steps

1. ✅ Complete Discord Developer setup
2. ✅ Complete Spotify API setup (optional)
3. ✅ Configure `.env` file
4. ✅ Test locally with `npm start`
5. ✅ Deploy to VPS or Docker
6. ✅ Test bot commands in Discord
7. ✅ Monitor logs and performance

---

**Questions?** Check the README.md or create an issue in the repository.
