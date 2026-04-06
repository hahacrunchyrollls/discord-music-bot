# 🚀 Advanced Features & Customization

## Table of Contents
1. [Silent Audio System](#silent-audio-system)
2. [AFK Persistence](#afk-persistence)
3. [Music Sources](#music-sources)
4. [Voice Channel Management](#voice-channel-management)
5. [Performance Optimization](#performance-optimization)
6. [Monitoring & Logging](#monitoring--logging)
7. [Customization](#customization)

---

## Silent Audio System

### How It Works

The bot uses **silent PCM audio** to maintain connection to Discord voice channels without being kicked for inactivity.

```javascript
// Silent audio is:
- 44.1kHz sample rate (standard Discord audio)
- 16-bit PCM encoding
- Mono channel
- Effectively 0dB volume
- Looped continuously
```

### Why It Works

- Discord doesn't kick bots for being in empty channels
- Silent audio prevents Discord's activity timeout
- No bandwidth waste compared to regular music
- No audible sound to other users
- Compatible with all voice regions

### Customization

To modify silent audio settings, edit `src/index.js`:

```javascript
const createSilentAudio = () => {
  const sampleRate = 44100;      // Change to 48000 for high quality
  const channels = 1;            // Change to 2 for stereo
  const bitsPerSample = 16;      // Standard 16-bit
  const duration = 1;            // Duration in seconds
  
  // ... rest of function
};
```

---

## AFK Persistence

### Auto-Reconnection

The bot automatically reconnects if disconnected:

```javascript
connection.on(VoiceConnectionStatus.Disconnected, () => {
  // Attempts to reconnect to same channel
  // Retries for 5 seconds before giving up
  entersState(connection, VoiceConnectionStatus.Connecting, 5000)
});
```

### Usage

```
/afk general
/afk voice-room
/afk 1234567890
```

### Advanced: Custom Channel Lookup

Modify the `handleAFK` function to use custom channel selection:

```javascript
// Current: Finds by name or ID
voiceChannel = channels.find(ch => 
  (ch.type === ChannelType.GuildVoice) && 
  (ch.name === channelInput || ch.id === channelInput)
);

// Custom: Find by category
// voiceChannel = channels.find(ch =>
//   ch.type === ChannelType.GuildVoice &&
//   ch.parent?.name === 'Music'
// );
```

---

## Music Sources

### Supported Sources

| Source | URL Pattern | Status | Auth Required |
|--------|------------|--------|--------------|
| YouTube | `youtube.com/watch?v=` | ✅ Active | None |
| Spotify | `open.spotify.com/track/` | ✅ Active | Client ID/Secret |
| Spotify Playlist | `open.spotify.com/playlist/` | ⚠️ Partial | Client ID/Secret |
| SoundCloud | `soundcloud.com/` | ⏳ Planned | API Key |
| Deezer | `deezer.com/track/` | ⏳ Planned | None |

### Adding YouTube Support

To add YouTube search integration, install `play-dl`:

```bash
npm install play-dl
```

Then modify `src/index.js`:

```javascript
import { play } from 'play-dl';

const searchYouTube = async (query) => {
  const yt_video = await play.search(query, {
    source: { youtube: 'video' },
    limit: 1,
  });
  
  if (yt_video.length === 0) return null;
  
  return {
    title: yt_video[0].title,
    url: yt_video[0].url,
    duration: yt_video[0].durationInSec
  };
};
```

### Adding SoundCloud Support

```bash
npm install soundcloud-scraper
```

```javascript
import SoundCloud from 'soundcloud-scraper';

const searchSoundCloud = async (query) => {
  const tracks = await SoundCloud.search(query, 'track');
  if (tracks.length === 0) return null;
  
  return {
    title: tracks[0].title,
    url: tracks[0].url,
    duration: tracks[0].duration
  };
};
```

---

## Voice Channel Management

### Multiple Guild Support

The bot stores connections per guild:

```javascript
const activeConnections = new Map(); // Maps guildId -> connection
const activePlayers = new Map();     // Maps guildId -> player
```

This allows the bot to connect to multiple servers simultaneously.

### Guild-Specific Settings

To add guild-specific configuration:

```javascript
const guildSettings = new Map();

const getGuildSettings = (guildId) => {
  if (!guildSettings.has(guildId)) {
    guildSettings.set(guildId, {
      autoAfkEnabled: true,
      autoAfkChannel: null,
      volume: 1.0,
    });
  }
  return guildSettings.get(guildId);
};

// Store to database (e.g., SQLite)
import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('bot-settings.db');
```

---

## Performance Optimization

### Memory Management

Monitor memory usage on VPS:

```bash
# Check memory
free -h

# Monitor process
top -p $(pgrep -f "node src/index.js")
```

### Optimization Tips

1. **Limit concurrent connections**
   ```javascript
   const MAX_CONNECTIONS = 5;
   
   if (activeConnections.size >= MAX_CONNECTIONS) {
     return interaction.reply('❌ Bot is at max capacity');
   }
   ```

2. **Clean up idle connections**
   ```javascript
   setInterval(() => {
     activeConnections.forEach((connection, guildId) => {
       if (connection.state.status === VoiceConnectionStatus.Ready) {
         // Connection is healthy
       }
     });
   }, 60000); // Check every minute
   ```

3. **Use connection timeouts**
   ```javascript
   const IDLE_TIMEOUT = 3600000; // 1 hour
   
   const idleTimers = new Map();
   
   const setIdleTimer = (guildId) => {
     clearTimeout(idleTimers.get(guildId));
     
     idleTimers.set(guildId, setTimeout(() => {
       if (activeConnections.has(guildId)) {
         activeConnections.get(guildId).destroy();
         console.log(`Guild ${guildId} disconnected due to inactivity`);
       }
     }, IDLE_TIMEOUT));
   };
   ```

---

## Monitoring & Logging

### Systemd Logs

```bash
# Real-time logs
sudo journalctl -u discord-music-bot -f

# Last 100 lines
sudo journalctl -u discord-music-bot -n 100

# Last hour
sudo journalctl -u discord-music-bot --since "1 hour ago"

# Errors only
sudo journalctl -u discord-music-bot -p 3
```

### Custom Logging

Add detailed logging to `src/index.js`:

```javascript
const logger = {
  info: (message) => console.log(`[INFO] ${new Date().toISOString()} - ${message}`),
  error: (message) => console.error(`[ERROR] ${new Date().toISOString()} - ${message}`),
  warn: (message) => console.warn(`[WARN] ${new Date().toISOString()} - ${message}`),
  debug: (message) => console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`),
};

// Usage
logger.info('Bot is starting');
logger.error(`Failed to connect: ${error.message}`);
```

### Log to File

```javascript
import fs from 'fs';

const logFile = fs.createWriteStream('bot.log', { flags: 'a' });

const fileLogger = (level, message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${level}] ${timestamp} - ${message}\n`;
  logFile.write(logMessage);
  console.log(logMessage.trim());
};

// Usage
fileLogger('INFO', 'Bot started');
```

---

## Customization

### Custom Commands

Add a custom DJ command:

```javascript
{
  name: 'dj',
  description: 'Assign DJ role to user',
  options: [
    {
      name: 'user',
      description: 'User to assign DJ role',
      type: 6, // User type
      required: true,
    },
  ],
},
```

Handle in interaction:

```javascript
case 'dj':
  if (!isAdmin(interaction.user.id)) {
    return interaction.reply('❌ Admin only');
  }
  
  const user = interaction.options.getUser('user');
  const member = await interaction.guild.members.fetch(user.id);
  
  const djRole = interaction.guild.roles.cache.find(r => r.name === 'DJ');
  if (djRole) {
    await member.roles.add(djRole);
    await interaction.reply(`✅ DJ role assigned to ${user.username}`);
  }
  break;
```

### Custom Status

Update bot status:

```javascript
client.on('ready', () => {
  client.user.setPresence({
    activities: [{
      name: 'Music 🎵',
      type: 'LISTENING',
    }],
    status: 'online',
  });
});
```

### Event Listeners

Add custom event handling:

```javascript
// Bot mentioned
client.on('messageCreate', (message) => {
  if (message.mentions.has(client.user)) {
    if (isAdmin(message.author.id)) {
      message.reply('👋 Use slash commands to control me!');
    }
  }
});

// Voice state changes
client.on('voiceStateUpdate', (oldState, newState) => {
  const guildId = oldState.guild.id;
  
  // Auto-pause if all users leave
  if (newState.channel === null && activeConnections.has(guildId)) {
    console.log(`All users left, keeping bot in channel`);
  }
});
```

---

## Database Integration (Optional)

### SQLite Setup

```bash
npm install sqlite3 sqlite
```

```javascript
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db;

const initDatabase = async () => {
  db = await open({
    filename: './bot-data.db',
    driver: sqlite3.Database
  });
  
  await db.exec(`
    CREATE TABLE IF NOT EXISTS guild_settings (
      guild_id TEXT PRIMARY KEY,
      prefix TEXT DEFAULT '/',
      volume REAL DEFAULT 1.0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS playlists (
      id INTEGER PRIMARY KEY,
      guild_id TEXT,
      name TEXT,
      tracks TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(guild_id) REFERENCES guild_settings(guild_id)
    );
  `);
};

// Call on bot startup
await initDatabase();
```

### Save Guild Settings

```javascript
const saveGuildSettings = async (guildId, settings) => {
  await db.run(
    `INSERT OR REPLACE INTO guild_settings (guild_id, volume) VALUES (?, ?)`,
    [guildId, settings.volume]
  );
};

const getGuildSettings = async (guildId) => {
  return await db.get(
    `SELECT * FROM guild_settings WHERE guild_id = ?`,
    [guildId]
  );
};
```

---

## Deployment Checklist

- [ ] All environment variables configured
- [ ] Bot token kept secret
- [ ] Systemd service enabled and running
- [ ] Logs are being monitored
- [ ] Backups of .env file stored securely
- [ ] Firewall allows outbound connections
- [ ] Adequate VPS resources (1GB RAM minimum)
- [ ] DNS/domain configured (if applicable)
- [ ] SSL certificate (if using web dashboard)
- [ ] Monitoring alerts set up

---

## Support & Debugging

Enable debug mode:

```bash
# On Linux/macOS
export DEBUG=*

# On Windows PowerShell
$env:DEBUG="*"

# Then start bot
npm start
```

Check for issues:

```javascript
// Add to src/index.js
client.on('error', error => {
  console.error('Client error:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
```

---

**Happy botting! 🎵**
