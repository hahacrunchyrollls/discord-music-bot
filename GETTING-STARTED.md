# 🚀 Getting Started - 5 Minute Quick Start

Welcome! Follow these simple steps to get your Discord music bot running.

## ⚡ 5-Minute Setup

### Step 1: Get Discord Credentials (2 min)

1. **Get Bot Token & Client ID:**
   - Go to https://discord.com/developers/applications
   - Click "New Application" → Name it → Click "Create"
   - Go to "Bot" section → Click "Add Bot"
   - Copy **TOKEN** (you'll need this)
   - Go to "General Information" → Copy **CLIENT ID**

2. **Get Your User ID:**
   - Open Discord
   - Settings → Advanced → Enable "Developer Mode"
   - Right-click your username → "Copy User ID"

3. **Invite Bot to Server:**
   ```
   https://discord.com/api/oauth2/authorize?client_id=PASTE_YOUR_CLIENT_ID_HERE&permissions=3147776&scope=bot%20applications.commands
   ```
   - Replace `PASTE_YOUR_CLIENT_ID_HERE` with your actual Client ID
   - Open link → Select server → Authorize

### Step 2: Create .env File (1 min)

1. Open a text editor (Notepad, VSCode, etc.)
2. Copy this:
   ```env
   DISCORD_TOKEN=paste_your_bot_token_here
   DISCORD_CLIENT_ID=paste_your_client_id_here
   ADMIN_USER_ID=paste_your_user_id_here
   SPOTIFY_CLIENT_ID=
   SPOTIFY_CLIENT_SECRET=
   ```
3. Paste your values (look at Step 1)
4. Save file as `.env` in the bot folder
   - **NOT** `.env.txt` - just `.env`
5. Done! You just configured your bot

### Step 3: Test Locally (1 min)

```bash
npm install
npm start
```

Your bot should go **ONLINE** in Discord (see it in member list).

### Step 4: Test Commands (1 min)

In Discord, type these:
- `/ping` - Check if bot responds
- `/jerico general` - Join and stay in voice
- Click command → Send

**Congratulations!** Your bot works! 🎉

---

## 📦 Next: Deploy to VPS (Optional)

### For Always-On Bot (24/7)

1. **Get a VPS** (Debian 12+)
   - Recommended: Hetzner, DigitalOcean, Linode
   - Cost: ~$3-5/month
   - Select: Debian 12

2. **SSH into VPS:**
   ```bash
   ssh root@your_vps_ip
   ```

3. **Run installer:**
   ```bash
   git clone <your-repo-url>
   cd discord-music-bot
   chmod +x install-debian12.sh
   sudo ./install-debian12.sh
   sudo nano /opt/discord-music-bot/.env
   # Paste your credentials and save
   sudo systemctl start discord-music-bot
   ```

Done! Bot now runs 24/7 with auto-restart.

---

## 🎵 Bot Commands

| Command | What It Does |
|---------|------------|
| `/play <query>` | Play music |
| `/jerico <voicechannelname>` | Join and stay AFK 24/7 |
| `/stop` | Stop & leave |
| `/jerico-reset` | Reset commands and leave channel |
| `/ping` | Check status |

**Only admin (you) can use these.**

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Bot won't start | Check `.env` file exists |
| Commands don't appear | Reinvite bot to server |
| Bot offline | `npm start` or check VPS: `sudo systemctl restart discord-music-bot` |
| Can't find channel | Use channel name exactly: `/jerico general` |

More help → See [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

## 📚 Documentation Map

| File | What For |
|------|----------|
| 👈 **You are here** | Quick start |
| [README.md](README.md) | Full overview |
| [SETUP.md](SETUP.md) | Detailed setup with pictures |
| [PROJECT-SUMMARY.md](PROJECT-SUMMARY.md) | Complete project guide |
| [QUICK-REFERENCE.md](QUICK-REFERENCE.md) | Command cheat sheet |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Problem solving |
| [ADVANCED.md](ADVANCED.md) | Customization & performance |
| [DEPLOYMENT-CHECKLIST.md](DEPLOYMENT-CHECKLIST.md) | Production checklist |
| [ARCHITECTURE.md](ARCHITECTURE.md) | How it all works (diagrams) |

---

## ✅ Checklist

- [ ] Got Discord Token & Client ID
- [ ] Got your User ID
- [ ] Created `.env` file with credentials
- [ ] Ran `npm install`
- [ ] Ran `npm start` - bot is online
- [ ] Tested `/ping` command
- [ ] Tested `/jerico` command
- [ ] (Optional) Deployed to VPS

---

## 🎯 Common Questions

**Q: Why do I need to add my User ID?**  
A: So only YOU can control the bot. Other users can't issue commands.

**Q: What's this Spotify stuff?**  
A: Optional. Lets you `/play spotify.com/track/...` URLs. Skip if you want.

**Q: Do I need a VPS?**  
A: No for testing. Yes for 24/7. Local testing is fine first.

**Q: Will my bot get kicked for being AFK?**  
A: No! Silent audio prevents that. Bot stays forever.

**Q: How much does it cost?**  
A: Free! (Bot code.) VPS ~$3/month optional.

**Q: Can other people use my bot?**  
A: Only you (ADMIN_USER_ID). By design.

---

## 🔧 Common Commands

```bash
# Test locally
npm start

# Stop running bot
Ctrl + C

# Check if Node.js installed
node --version

# Install dependencies
npm install

# View bot logs (VPS)
sudo journalctl -u discord-music-bot -f

# Restart bot (VPS)
sudo systemctl restart discord-music-bot

# Update bot (VPS)
cd /opt/discord-music-bot
git pull
npm install
sudo systemctl restart discord-music-bot
```

---

## 📞 Need Help?

1. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. Check [SETUP.md](SETUP.md) for detailed steps
3. Check bot logs:
   ```bash
   npm start  # for local
   sudo journalctl -u discord-music-bot -f  # for VPS
   ```
4. Read error messages carefully - they tell you what's wrong

---

## What Happens Next

1. **Admin issues command** → Bot receives it
2. **Bot checks permissions** → Only you can use
3. **Bot joins voice channel** → Uses voicediscord.js
4. **Bot plays silent audio** → Inaudible PCM stream
5. **Discord doesn't kick bot** → No 15-min timeout
6. **Bot stays 24/7** → Until you `/stop`

That's it! Simple and effective.

---

## 🎉 You're Ready!

Your Discord music bot is ready to use. Start with:

```bash
npm install
npm start
```

Then test in Discord with `/ping`.

**Enjoy your bot!** 🎵

---

**Next Steps:**
- Read [README.md](README.md) for full feature list
- Follow [SETUP.md](SETUP.md) for detailed setup
- Deploy to VPS when ready for 24/7 uptime

**Questions?** Check the documentation files or run `npm start` and check the logs.

---

*This is a personal use bot. Only admin (ADMIN_USER_ID) can control it. Share safely!*
