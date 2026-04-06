# ✅ Deployment Checklist

Use this checklist to ensure proper deployment of the Discord Spotify Music Bot.

## Pre-Deployment

### Discord Setup
- [ ] Created Discord application at [Discord Developer Portal](https://discord.com/developers/applications)
- [ ] Created bot user in the application
- [ ] Copied bot token to `.env` (DISCORD_TOKEN)
- [ ] Copied client ID to `.env` (DISCORD_CLIENT_ID)
- [ ] Obtained your Discord user ID
- [ ] Set ADMIN_USER_ID in `.env`
- [ ] Invited bot to Discord server with proper permissions
- [ ] Verified bot appears in server member list
- [ ] Verified slash commands are visible (type `/`)

### Spotify Setup (Optional but Recommended)
- [ ] Created Spotify application at [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
- [ ] Copied Spotify Client ID to `.env` (SPOTIFY_CLIENT_ID)
- [ ] Copied Spotify Client Secret to `.env` (SPOTIFY_CLIENT_SECRET)
- [ ] Verified Spotify API credentials are active

### Development Testing (Local)
- [ ] Installed Node.js 18+ on local machine
- [ ] Installed ffmpeg on local machine
- [ ] Cloned repository
- [ ] Ran `npm install` successfully
- [ ] Created and configured `.env` file locally
- [ ] Started bot with `npm start`
- [ ] Verified bot appears online in Discord
- [ ] Tested `/play` command
- [ ] Tested `/afk` command
- [ ] Tested `/ping` command
- [ ] Verified bot stays in voice channel
- [ ] Checked logs for any errors

## VPS Deployment (Debian 12+)

### Server Preparation
- [ ] Rented VPS with Debian 12+ OS
- [ ] SSH access available
- [ ] At least 1GB RAM available
- [ ] At least 10GB disk space available
- [ ] Stable internet connection
- [ ] Firewall allows outbound connections on ports 80, 443, 5222

### Automated Installation
- [ ] SSH into VPS as root: `ssh root@your_vps_ip`
- [ ] Cloned repository: `git clone <your-repo-url>`
- [ ] Made installer executable: `chmod +x install-debian12.sh`
- [ ] Ran automated installer: `sudo ./install-debian12.sh`
- [ ] Installation completed successfully without errors
- [ ] Verified `/opt/discord-music-bot/` directory exists

### Manual Configuration
- [ ] Edited `.env` file: `sudo nano /opt/discord-music-bot/.env`
- [ ] Entered all required environment variables:
  - [ ] DISCORD_TOKEN
  - [ ] DISCORD_CLIENT_ID
  - [ ] ADMIN_USER_ID
  - [ ] SPOTIFY_CLIENT_ID (optional)
  - [ ] SPOTIFY_CLIENT_SECRET (optional)
- [ ] Saved and exited editor (Ctrl+X, Y, Enter)
- [ ] Verified `.env` file contents: `sudo cat /opt/discord-music-bot/.env`

### Service Configuration
- [ ] Systemd service file created at `/etc/systemd/system/discord-music-bot.service`
- [ ] Reloaded systemd daemon: `sudo systemctl daemon-reload`
- [ ] Enabled auto-start: `sudo systemctl enable discord-music-bot`
- [ ] Started service: `sudo systemctl start discord-music-bot`
- [ ] Checked service status: `sudo systemctl status discord-music-bot`
- [ ] Status shows "active (running)"

### Service Verification
- [ ] Viewed logs: `sudo journalctl -u discord-music-bot -f`
- [ ] No critical errors in logs
- [ ] Bot appears online in Discord
- [ ] Slash commands visible in Discord
- [ ] Service stays running after a few minutes
- [ ] No automatic restarts occurring

## Post-Deployment Testing

### Basic Functionality
- [ ] `/ping` command responds with latency
- [ ] `/play spotify.com/track/xxx` command works (if Spotify configured)
- [ ] `/play test music` search works (optional with YouTube integration)
- [ ] `/afk general` command works
- [ ] Bot joins specified voice channel
- [ ] Bot plays silent audio (unheard by users)
- [ ] `/stop` command disconnects bot
- [ ] `/leave` command disconnects bot
- [ ] Admin-only enforcement works (non-admin cannot use commands)

### Stability Testing
- [ ] Bot stays online for at least 1 hour without disconnecting
- [ ] Bot stays AFK for at least 1 hour without being kicked
- [ ] Check memory usage is reasonable: `free -h`
- [ ] Check CPU usage is low: `top`
- [ ] Logs show no error messages
- [ ] No automatic service restarts occurring

### Voice Channel Testing
- [ ] Bot can join empty channels
- [ ] Bot can join channels with users
- [ ] Bot playback has no audio glitches
- [ ] Bot disconnects properly when commanded
- [ ] Bot reconnects if manually disconnected by Discord
- [ ] Silent audio volume is appropriate

### Monitoring
- [ ] Set up log monitoring: `watch -n 5 'sudo systemctl status discord-music-bot'`
- [ ] Monitor resource usage: `watch -n 5 'free -h && ps aux | grep node'`
- [ ] Verified alert system works (if configured)
- [ ] Tested bot recovery after manual restart

## Security Verification

- [ ] `.env` file is NOT in version control (check `.gitignore`)
- [ ] `.env` has restricted permissions: 600
- [ ] No credentials logged in bot output
- [ ] No credentials in Discord messages
- [ ] Admin-only access is enforced
- [ ] Only authorized admin can use bot
- [ ] All connections use Discord's HTTPS API
- [ ] Firewall is configured properly

### Credentials Security
- [ ] Discord token is strong and unique
- [ ] Spotify credentials are not shared
- [ ] `.env` file is backed up securely
- [ ] No backups of `.env` in public locations
- [ ] Regular credential rotation planned
- [ ] Compromise protocols established

## Backup & Recovery

- [ ] Created backup of `.env` file: `sudo cp /opt/discord-music-bot/.env /opt/discord-music-bot/.env.backup`
- [ ] Backup stored securely (USB drive, cloud storage, etc.)
- [ ] Tested restore procedure
- [ ] Created git remote backup
- [ ] Verified git is up to date: `git status`
- [ ] Created documentation of deployment process

## Documentation

- [ ] Updated deployment documentation
- [ ] Documented VPS IP/hostname
- [ ] Documented admin user ID
- [ ] Created runbook for common tasks
- [ ] Documented any custom configurations
- [ ] Created troubleshooting guide for team
- [ ] Set up monitoring alerts
- [ ] Documented escalation procedures

## Maintenance Plan

- [ ] Daily: Monitor logs and check status
- [ ] Weekly: Check resource usage, test all commands
- [ ] Monthly: Update dependencies, review logs
- [ ] Quarterly: Test recovery procedures, audit security
- [ ] Maintenance window scheduled: _____________

## 24/7 Uptime Configuration

- [ ] Systemd service is enabled: `sudo systemctl is-enabled discord-music-bot`
- [ ] Restart policy is set to "always"
- [ ] RestartSec is configured (10 seconds)
- [ ] Service can survive short network outages
- [ ] Graceful shutdown handlers are implemented
- [ ] Emergency restart procedure documented

## Final Checks

- [ ] All checklist items completed ✅
- [ ] No outstanding issues or errors
- [ ] Performance is within acceptable limits
- [ ] Team is trained on management procedures
- [ ] Runbooks are accessible
- [ ] Contact information documented
- [ ] Success! Bot is ready for production 🚀

---

## Rollback Procedure

If issues arise, here's how to rollback:

```bash
cd /opt/discord-music-bot
git log --oneline              # View commit history
git checkout <previous-hash>   # Go to previous version
npm install                    # Install dependencies
sudo systemctl restart discord-music-bot
```

## Quick Troubleshooting

| Issue | Quick Fix |
|-------|-----------|
| Bot offline | `sudo systemctl restart discord-music-bot` |
| High memory | `sudo systemctl restart discord-music-bot` |
| Commands missing | Check bot permissions, reinvite bot |
| Spotify not working | Verify credentials in `.env` |
| Disconnecting | Check internet connection, increase timeout |
| Can't view logs | Run with `sudo`: `sudo journalctl -u discord-music-bot -f` |

---

## Sign-Off

- **Deployed By:** _____________________
- **Date:** _____________________
- **Version:** _____________________
- **Server/IP:** _____________________
- **Status:** ☐ In Development ☐ Testing ☐ Production
- **Notes:** _____________________

---

**Deployment Complete!** 🎉

Bot is now running 24/7 and admin can use slash commands to control it. Check logs regularly and monitor performance.
