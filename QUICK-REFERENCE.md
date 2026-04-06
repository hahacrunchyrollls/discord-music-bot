# 📚 Quick Reference Guide

## Command Quick Reference

### Bot Commands (Discord Slash Commands)

```
/play <query>              - Play music
/afk <channel>             - Stay AFK in voice channel
/stop                      - Stop music
/leave                     - Leave voice channel
/ping                      - Check latency
```

## VPS Quick Commands

### Service Management

```bash
# Start bot
sudo systemctl start discord-music-bot

# Stop bot
sudo systemctl stop discord-music-bot

# Restart bot
sudo systemctl restart discord-music-bot

# Check status
sudo systemctl status discord-music-bot

# Enable auto-start
sudo systemctl enable discord-music-bot

# Disable auto-start
sudo systemctl disable discord-music-bot
```

### Monitoring

```bash
# Real-time logs
sudo journalctl -u discord-music-bot -f

# Last 50 lines
sudo journalctl -u discord-music-bot -n 50

# Errors only
sudo journalctl -u discord-music-bot -p err

# Search in logs
sudo journalctl -u discord-music-bot | grep "error"

# Check resource usage
ps aux | grep "node src"

# Monitor in real-time
top

# Check disk space
df -h

# Check memory
free -h
```

### File Management

```bash
# Edit .env file
sudo nano /opt/discord-music-bot/.env

# View .env file
sudo cat /opt/discord-music-bot/.env

# Backup .env file
sudo cp /opt/discord-music-bot/.env /opt/discord-music-bot/.env.backup

# Update bot from git
cd /opt/discord-music-bot
git pull origin main
npm install
sudo systemctl restart discord-music-bot
```

## Docker Quick Commands

### Container Management

```bash
# Build image
docker build -t discord-music-bot .

# Run container
docker run -d --name discord-bot --env-file .env discord-music-bot

# View logs
docker logs -f discord-bot

# Stop container
docker stop discord-bot

# Start container
docker start discord-bot

# Remove container
docker rm discord-bot

# Check running containers
docker ps

# Check all containers
docker ps -a
```

### Docker Compose

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Restart service
docker-compose restart

# Update and restart
git pull
docker-compose build --no-cache
docker-compose up -d
```

## Environment Variables

```env
DISCORD_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_client_id_here
ADMIN_USER_ID=your_discord_user_id_here
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
```

## Useful Links

- [Discord Developer Portal](https://discord.com/developers/applications)
- [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
- [Discord.js Documentation](https://discord.js.org/)
- [Voice Guide](https://discordjs.guide/voice/)
- [Node.js Documentation](https://nodejs.org/docs/)

## File Locations (VPS)

```
/opt/discord-music-bot/          # Bot directory
├── src/
│   └── index.js                 # Main bot file
├── .env                         # Configuration file
├── package.json                 # Dependencies
└── install-debian12.sh          # Installer script

/etc/systemd/system/discord-music-bot.service  # Service file
```

## Common Issues & Fixes

### Bot Won't Start
```bash
# Check logs
sudo journalctl -u discord-music-bot -n 50

# Check .env file
sudo nano /opt/discord-music-bot/.env

# Verify Node.js
node --version

# Check ffmpeg
which ffmpeg
```

### High Memory Usage
```bash
# Restart bot
sudo systemctl restart discord-music-bot

# Check process
ps aux | grep node

# Check system memory
free -h
```

### Disconnects Frequently
```bash
# Check systemd logs
sudo journalctl -u discord-music-bot -f

# Check network
ping google.com

# Restart bot
sudo systemctl restart discord-music-bot
```

### Can't Find Spotify Tracks
```bash
# Verify Spotify credentials
sudo nano /opt/discord-music-bot/.env

# Check Spotify API status
# Visit: https://developer.spotify.com/dashboard

# Try YouTube URL instead
/play https://www.youtube.com/watch?v=...
```

## Performance Tips

### Reduce Memory Usage
```bash
# Limit bot instances
ulimit -m 512000  # 500MB max

# Check current limits
ulimit -a
```

### Improve Uptime
```bash
# Auto-restart on crash
# (Already configured in systemd service)

# Monitor with:
watch -n 5 "systemctl status discord-music-bot"
```

### Optimize Network
```bash
# Check connection
ping -c 10 8.8.8.8

# Test bandwidth
speedtest-cli

# Check latency
mtr google.com
```

## Maintenance Schedule

### Daily
- ✅ Monitor logs: `sudo journalctl -u discord-music-bot -f`
- ✅ Check bot status: `sudo systemctl status discord-music-bot`

### Weekly
- ✅ Check disk space: `df -h`
- ✅ Check memory: `free -h`
- ✅ Review error logs: `sudo journalctl -u discord-music-bot -p err`

### Monthly
- ✅ Update dependencies: `cd /opt/discord-music-bot && git pull && npm install`
- ✅ Backup .env file: `sudo cp .env .env.backup`
- ✅ Check VPS resources
- ✅ Review security logs

### Quarterly
- ✅ Rotate credentials if needed
- ✅ Update Node.js: `nvm install node@latest`
- ✅ Full system update: `apt-get update && apt-get upgrade`

## Getting Help

1. Check the [README.md](README.md)
2. Review [SETUP.md](SETUP.md)
3. Check [ADVANCED.md](ADVANCED.md)
4. Check logs: `sudo journalctl -u discord-music-bot -f`
5. Create an issue in the repository

---

**Quick Setup Reminder:**

1. Get Discord Token & Client ID
2. Get Spotify API credentials
3. Get your Discord User ID
4. Create `.env` file
5. Run installer on VPS
6. Start bot: `sudo systemctl start discord-music-bot`
7. Test with `/play` command

---

**Happy botting! 🎵**
