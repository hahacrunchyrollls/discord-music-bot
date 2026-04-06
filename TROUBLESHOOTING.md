# ❌ Troubleshooting Guide

## Quick Diagnostics

Run this command to check bot health:

```bash
sudo systemctl status discord-music-bot && sudo journalctl -u discord-music-bot -n 20
```

---

## Problems & Solutions

### 🔴 Bot Won't Start

#### Problem: "Module not found" error

**Symptoms:**
```
Error: Cannot find module 'discord.js'
```

**Solutions:**
1. Reinstall dependencies:
   ```bash
   cd /opt/discord-music-bot
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Check Node.js version (need 18+):
   ```bash
   node --version
   ```

3. Verify npm is working:
   ```bash
   npm list discord.js
   ```

#### Problem: "DISCORD_TOKEN not provided"

**Symptoms:**
```
Error: Token is not a valid token provided
```

**Solutions:**
1. Check .env file exists:
   ```bash
   cat /opt/discord-music-bot/.env
   ```

2. Verify token format (should be long string):
   ```bash
   grep "DISCORD_TOKEN=" /opt/discord-music-bot/.env
   ```

3. Check token hasn't expired:
   - Go to Discord Developer Portal
   - Regenerate token if needed

4. Ensure no extra spaces:
   ```bash
   nano /opt/discord-music-bot/.env
   # DISCORD_TOKEN=xxxxx (no spaces around =)
   ```

#### Problem: Permission denied

**Symptoms:**
```
Error: Permission denied at /opt/discord-music-bot/src/
```

**Solutions:**
1. Fix permissions:
   ```bash
   sudo chmod -R 755 /opt/discord-music-bot
   sudo systemctl restart discord-music-bot
   ```

2. Check file ownership:
   ```bash
   ls -la /opt/discord-music-bot/
   ```

---

### 🟡 Bot Offline / Not Responding

#### Problem: Bot appears offline in Discord

**Symptoms:**
- Bot status shows as offline
- Slash commands don't appear

**Solutions:**
1. Check if bot is actually running:
   ```bash
   sudo systemctl status discord-music-bot
   ```

2. If not running, start it:
   ```bash
   sudo systemctl start discord-music-bot
   sudo systemctl enable discord-music-bot
   ```

3. Check logs for errors:
   ```bash
   sudo journalctl -u discord-music-bot -f
   ```

4. Verify token is valid:
   ```bash
   grep "DISCORD_TOKEN=" /opt/discord-music-bot/.env
   ```

#### Problem: Slash commands not showing in Discord

**Symptoms:**
- Type `/` but no commands appear
- "No application found"

**Solutions:**
1. Verify bot has permissions:
   - Discord Server → Settings → Integrations
   - Check bot has "Use Slash Commands" permission

2. Re-invite bot with correct scopes:
   ```
   https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=3147776&scope=bot%20applications.commands
   ```

3. Check DISCORD_CLIENT_ID is correct:
   ```bash
   grep "DISCORD_CLIENT_ID=" /opt/discord-music-bot/.env
   ```

4. Wait a few minutes for Discord to sync

---

### 🔴 Can't Join Voice Channels

#### Problem: "Bot cannot connect to voice channel"

**Symptoms:**
```
❌ Error: Voice channel not found or cannot access
```

**Solutions:**
1. Verify bot permissions:
   - Server Settings → Roles → Select bot role
   - Enable: "Connect" and "Speak"

2. Check voice channel is accessible:
   ```bash
   # Make sure bot role can access the channel
   ```

3. Verify ffmpeg is installed:
   ```bash
   which ffmpeg
   ffmpeg -version
   ```

4. If using Docker, ensure audio is available:
   ```bash
   docker exec discord-bot which ffmpeg
   ```

---

### 🟡 Music Won't Play / Quality Issues

#### Problem: Silent audio not working

**Symptoms:**
- Bot joins but no sound
- Still gets kicked after 5 minutes

**Solutions:**
1. Verify opusscript is installed:
   ```bash
   npm list opusscript
   
   # If missing, install:
   npm install opusscript
   ```

2. Check ffmpeg is working:
   ```bash
   ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -f s16le -t 1 - | xxd | head
   ```

3. Restart bot:
   ```bash
   sudo systemctl restart discord-music-bot
   ```

4. Check logs for audio errors:
   ```bash
   sudo journalctl -u discord-music-bot | grep -i "audio\|voice"
   ```

---

### 🔴 Spotify URLs Not Working

#### Problem: "Spotify track not found" error

**Symptoms:**
```
❌ Error parsing Spotify track
```

**Solutions:**
1. Verify Spotify credentials:
   ```bash
   grep "SPOTIFY_CLIENT_ID=" /opt/discord-music-bot/.env
   grep "SPOTIFY_CLIENT_SECRET=" /opt/discord-music-bot/.env
   ```

2. Check credentials in Spotify Dashboard:
   - Go to https://developer.spotify.com/dashboard
   - Verify Client ID and Secret match

3. Test API connection:
   ```bash
   curl -X POST https://accounts.spotify.com/api/token \
     -H "Authorization: Basic $(echo -n 'CLIENT_ID:SECRET' | base64)" \
     -d "grant_type=client_credentials"
   ```

4. Verify URL format:
   ```
   ✅ Correct: https://open.spotify.com/track/11dFghVXANMlKmJXsNCQvb
   ❌ Wrong: https://spotify.com/track/...
   ```

#### Problem: "Token expired" error

**Symptoms:**
```
Error getting Spotify token: Unauthorized
```

**Solutions:**
1. Regenerate Spotify credentials:
   - Go to Spotify Developer Dashboard
   - Click your app
   - Click "Edit Settings"
   - Reset Client Secret

2. Update .env file:
   ```bash
   sudo nano /opt/discord-music-bot/.env
   # Update SPOTIFY_CLIENT_SECRET
   ```

3. Restart bot:
   ```bash
   sudo systemctl restart discord-music-bot
   ```

---

### 🟡 High CPU/Memory Usage

#### Problem: Bot consuming too much resources

**Symptoms:**
```
top: VIRT 500M, RES 300M, %CPU 80%
```

**Solutions:**
1. Check active connections:
   ```bash
   ps aux | grep "node src"
   ```

2. Restart bot to clear memory:
   ```bash
   sudo systemctl restart discord-music-bot
   ```

3. Check for zombie connections:
   ```bash
   sudo journalctl -u discord-music-bot | grep -i "disconnected\|reconnect"
   ```

4. Increase VPS memory if consistently high:
   ```bash
   free -h  # Check available memory
   ```

---

### 🔴 Bot Keeps Disconnecting

#### Problem: "Connection lost" error

**Symptoms:**
- Bot disconnects after random intervals
- Connection status keeps changing

**Solutions:**
1. Check network stability:
   ```bash
   ping -c 10 8.8.8.8
   mtr google.com  # If available
   ```

2. Increase connection timeout:
   - Edit `src/index.js`
   - Change `entersState(connection, ..., 5000)` to `10000`

3. Check firewall:
   ```bash
   sudo ufw status
   # Make sure outbound connections are allowed
   ```

4. Review Discord status page:
   - https://discordstatus.com

5. Check logs:
   ```bash
   sudo journalctl -u discord-music-bot | grep -i "error\|disconnected"
   ```

#### Problem: "Voice connection failed"

**Symptoms:**
```
[ERROR] Voice connection failed
```

**Solutions:**
1. Verify voice region:
   - Server Settings → Overview → Region
   - Ensure it matches your location

2. Check bot permissions again:
   - Server Settings → Roles → Bot role
   - Verify "Connect" and "Speak" are enabled

3. Try different voice channel:
   - `/leave`
   - Join different channel
   - `/afk #channel-name`

---

### 📊 Monitoring Issues

#### Problem: Can't view logs

**Symptoms:**
```
User not in sudoers file
```

**Solutions:**
1. Use sudo:
   ```bash
   sudo journalctl -u discord-music-bot
   ```

2. Add user to sudoers:
   ```bash
   sudo usermod -aG sudo username
   ```

---

## Health Check

Run this to verify bot is working:

```bash
#!/bin/bash

echo "🔍 Discord Bot Health Check"
echo "============================"
echo ""

# Check service status
echo "✓ Service Status:"
sudo systemctl is-active discord-music-bot

# Check process
echo ""
echo "✓ Process Running:"
ps aux | grep "[n]ode src/index.js"

# Check logs for errors
echo ""
echo "✓ Recent Errors:"
sudo journalctl -u discord-music-bot -p 3 -n 5

# Check disk space
echo ""
echo "✓ Disk Space:"
df -h /opt/discord-music-bot

# Check memory
echo ""
echo "✓ Memory Usage:"
free -h | head -2

# Check network
echo ""
echo "✓ Internet Connection:"
ping -c 1 8.8.8.8 2>&1 | tail -1

echo ""
echo "✓ ffmpeg Available:"
which ffmpeg

echo ""
echo "✓ Node.js Version:"
node --version

echo ""
echo "✓ Bot Version:"
npm list discord.js | head -2
```

Save as `health-check.sh` and run:
```bash
chmod +x health-check.sh
./health-check.sh
```

---

## Recovery Tips

### Emergency Restart
```bash
sudo systemctl restart discord-music-bot
```

### Full Reset
```bash
sudo systemctl stop discord-music-bot
cd /opt/discord-music-bot
git pull origin main
npm install
sudo systemctl start discord-music-bot
sudo journalctl -u discord-music-bot -f
```

### Rollback to Previous Version
```bash
cd /opt/discord-music-bot
git log --oneline
git checkout <commit-hash>
npm install
sudo systemctl restart discord-music-bot
```

---

## Support Resources

1. **Discord.js Documentation**: https://discord.js.org
2. **Voice Guide**: https://discordjs.guide/voice/
3. **Discord Developer Portal**: https://discord.com/developers
4. **Spotify API Docs**: https://developer.spotify.com/documentation/web-api
5. **Node.js Docs**: https://nodejs.org/docs/

---

## Create Support Bundle

```bash
#!/bin/bash

echo "Creating support bundle..."

mkdir -p support-bundle

# Bot logs
sudo journalctl -u discord-music-bot -n 100 > support-bundle/bot-logs.txt

# System info
uname -a > support-bundle/system-info.txt
node --version >> support-bundle/system-info.txt
npm --version >> support-bundle/system-info.txt
which ffmpeg >> support-bundle/system-info.txt

# Disk/Memory info
df -h > support-bundle/disk-info.txt
free -h > support-bundle/memory-info.txt

# Package versions
npm list > support-bundle/packages.txt

# Create tarball
tar -czf support-bundle.tar.gz support-bundle/
echo "✅ Support bundle created: support-bundle.tar.gz"
```

---

**Still not working?** Create an issue with the `support-bundle.tar.gz` file and complete bot logs.
