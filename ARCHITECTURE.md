# 🏗️ Bot Architecture & Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Your Discord Server                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Admin User                                          │  │
│  │  ├─ Issues: /play, /afk, /stop Commands             │  │
│  │  └─ Only this user can control bot                  │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Voice Channel                                       │  │
│  │  ├─ Bot joins here                                   │  │
│  │  ├─ Plays silent audio (inaudible)                  │  │
│  │  └─ Stays 24/7 without disconnection               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
          │
          │ Discord API
          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Discord Bot                              │
│                  (Running on VPS)                           │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ discord.js Client                                    │ │
│  │ ├─ Listens for slash commands                        │ │
│  │ ├─ Manages guild connections                         │ │
│  │ └─ Handles voice state updates                       │ │
│  └───────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ @discordjs/voice                                     │ │
│  │ ├─ Manages voice connections                         │ │
│  │ ├─ Creates audio players                              │ │
│  │ └─ Handles PCM audio encoding                        │ │
│  └───────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Spotify API Integration                              │ │
│  │ ├─ Resolves Spotify URLs                             │ │
│  │ ├─ Gets track metadata                               │ │
│  │ └─ Caches authentication tokens                      │ │
│  └───────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Audio System                                         │ │
│  │ ├─ Silent PCM buffer (44.1kHz)                       │ │
│  │ ├─ Looped playback                                   │ │
│  │ └─ Auto-reconnection on disconnect                  │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Command Flow Diagram

```
Admin User Issues Command (/play)
          │
          ▼
┌─────────────────────────┐
│ discord.js Listener     │
│ (interactionCreate)     │
└─────────────────────────┘
          │
          ▼
┌─────────────────────────┐
│ Check Admin Permission  │
│ (ADMIN_USER_ID check)   │
└─────────────────────────┘
          │
     ┌────┴────┐
     │         │
    YES        NO
     │         │
     ▼         ▼
  Process   Send Error
  Command   Message
     │      (ephemeral)
     │
     ├─ /play
     │  ├─ Parse query
     │  ├─ Check if Spotify URL
     │  │  └─ If yes: Resolve via Spotify API
     │  ├─ Find user's voice channel
     │  ├─ Join channel (if not already)
     │  └─ Play silent audio
     │
     ├─ /afk
     │  ├─ Find channel by name/ID
     │  ├─ Join channel
     │  ├─ Play silent audio looped
     │  └─ Stay indefinitely
     │
     ├─ /stop
     │  ├─ Stop audio player
     │  ├─ Disconnect from voice
     │  └─ Clean up resources
     │
     ├─ /leave
     │  └─ Destroy connection
     │
     └─ /ping
        └─ Return latency (client.ws.ping)
```

---

## Voice Connection Lifecycle

```
START
  │
  ▼
┌──────────────────────────┐
│ /afk command received    │
└──────────────────────────┘
  │
  ▼
┌──────────────────────────┐
│ joinVoiceChannel()       │
│ (Create connection)      │
└──────────────────────────┘
  │
  ▼
┌──────────────────────────────────┐
│ Connection State: Connecting     │
│ (Sending UDP packets)            │
└──────────────────────────────────┘
  │
  ▼
┌──────────────────────────────────┐
│ Connection State: Ready          │
│ (Session established)            │
└──────────────────────────────────┘
  │
  ▼
┌──────────────────────────────────┐
│ Create Audio Player              │
│ + Create Silent Audio Resource   │
│ + Subscribe connection to player │
└──────────────────────────────────┘
  │
  ▼
┌──────────────────────────────────┐
│ Player Status: Playing           │
│ (Streaming silent PCM audio)     │
└──────────────────────────────────┘
  │
  ├─ If Idle (audio finished):
  │  └─ Auto-replay silent audio
  │
  ├─ If Disconnected:
  │  ├─ Sleep 5 seconds
  │  ├─ Try reconnect
  │  └─ If success: Resume playing
  │     If fail: Destroy & log error
  │
  └─ If /stop command:
     ├─ Player.stop()
     ├─ Connection.destroy()
     ├─ Clean up resources
     └─ END

24/7 OPERATION
  │
  ▼
Silent audio loops continuously
preventing Discord's 15-min timeout
```

---

## Data Flow: Spotify Track Resolution

```
Admin User: /play https://open.spotify.com/track/xyz
            │
            ▼
┌─────────────────────────────┐
│ Extract Track ID from URL   │
│ (Regex: /track/([a-z0-9]+)/)│
└─────────────────────────────┘
            │
            ▼
┌─────────────────────────────┐
│ Check Spotify Token         │
│ (Cached in memory)          │
└─────────────────────────────┘
            │
        ┌───┴───┐
        │       │
     Valid   Expired
        │       │
        │       ▼
        │   ┌──────────────────────────┐
        │   │ Request New Token        │
        │   │ (Client Credentials)     │
        │   └──────────────────────────┘
        │       │
        └───┬───┘
            │
            ▼
┌─────────────────────────────┐
│ Call Spotify API            │
│ GET /v1/tracks/{trackId}    │
│ With Bearer Token           │
└─────────────────────────────┘
            │
            ▼
┌─────────────────────────────┐
│ Parse Response              │
│ ├─ Track name               │
│ ├─ Artist name              │
│ ├─ Album art (optional)     │
│ └─ Duration (optional)      │
└─────────────────────────────┘
            │
            ▼
┌─────────────────────────────┐
│ Return Track Query          │
│ e.g., "Song Name Artist"    │
└─────────────────────────────┘
            │
            ▼
Reply: "Now playing: Song Name"
```

---

## Deployment Architecture: VPS

```
┌─────────────────────────────────────────────────┐
│         Debian 12+ Virtual Private Server       │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────────────────────┐  │
│  │ Systemd (Service Manager)               │  │
│  │ ├─ docker-music-bot.service             │  │
│  │ │  ├─ auto-start on boot                │  │
│  │ │  ├─ restart on crash (always)         │  │
│  │ │  ├─ restart-sec: 10 seconds           │  │
│  │ │  └─ journal logging                   │  │
│  │ └─ Other system services                │  │
│  └─────────────────────────────────────────┘  │
│           │                                    │
│           ▼                                    │
│  ┌─────────────────────────────────────────┐  │
│  │ Node.js Process                         │  │
│  │ ├─ PID: nnnn                            │  │
│  │ ├─ Memory: ~80MB                        │  │
│  │ ├─ CPU: <5%                             │  │
│  │ └─ Uptime: 99.9%                        │  │
│  └─────────────────────────────────────────┘  │
│           │                                    │
│           ├─ discord.js                       │
│           ├─ @discordjs/voice                 │
│           ├─ ffmpeg (spawned as subprocess)   │
│           └─ (Other dependencies)             │
│                                                 │
│  ┌─────────────────────────────────────────┐  │
│  │ Filesystem                              │  │
│  │ /opt/discord-music-bot/                 │  │
│  │  ├─ src/index.js                        │  │
│  │  ├─ node_modules/ (300+ packages)       │  │
│  │  ├─ .env (secrets)                      │  │
│  │  ├─ package.json                        │  │
│  │  └─ package-lock.json                   │  │
│  └─────────────────────────────────────────┘  │
│           │                                    │
│           ▼                                    │
│  ┌─────────────────────────────────────────┐  │
│  │ Network                                 │  │
│  │ ├─ Outbound: Discord API (WSS 443)      │  │
│  │ ├─ Outbound: Spotify API (HTTPS 443)    │  │
│  │ ├─ UDP: RTP for voice packets           │  │
│  │ └─ DNS: For API domains                 │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
└─────────────────────────────────────────────────┘
         │
         │ Internet
         │
         ▼
    Discord Servers
    ├─ API endpoints
    ├─ Voice servers
    └─ WebSocket connections
```

---

## Silent Audio Data Flow

```
START: /afk command
       │
       ▼
┌──────────────────────────────┐
│ createSilentAudio()          │
│ ├─ Sample rate: 44,100 Hz    │
│ ├─ Channels: 1 (mono)        │
│ ├─ Bits: 16-bit PCM          │
│ ├─ Duration: 1 second        │
│ └─ Buffer: 88,200 bytes      │
│    (all zeros = silence)     │
└──────────────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ createAudioResource()        │
│ ├─ Buffer source             │
│ ├─ Inline volume enabled     │
│ ├─ Volume: 0.01 (inaudible)  │
│ └─ Codec: Opus (Discord)     │
└──────────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ createAudioPlayer()              │
│ ├─ Idle state listener           │
│ ├─ Error handling                │
│ └─ Subscription to connection    │
└──────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ PLAYING STATE                    │
│ ├─ Sends UDP packets to Discord  │
│ ├─ Encoded in Opus codec         │
│ ├─ Inaudible to all users        │
│ └─ Prevents 15-minute timeout    │
└──────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ On Audio Finish (Idle Event):    │
│ ├─ Replay same silent audio      │
│ ├─ Loop continuously             │
│ └─ Repeat forever or until /stop │
└──────────────────────────────────┘

24/7 Operation:
Audio loops → No timeout → Always online
```

---

## Error Recovery Flow

```
Discord Connection Active
        │
        ▼
┌──────────────────────────────┐
│ Connection.on('Disconnected')│
│ (Discord kicked bot or      │
│  network issue)             │
└──────────────────────────────┘
        │
        ▼
┌──────────────────────────────┐
│ Log: "Reconnecting..."       │
│ Try: entersState(..., 5000)  │
└──────────────────────────────┘
        │
     ┌──┴──┐
     │     │
   YES    NO
     │     │
     │     ▼
     │   ┌──────────────────────┐
     │   │ Timeout occurred     │
     │   │ (5 seconds passed)   │
     │   └──────────────────────┘
     │     │
     │     ▼
     │   ┌──────────────────────┐
     │   │ connection.destroy() │
     │   │ Remove from Map      │
     │   │ Log error            │
     │   └──────────────────────┘
     │     │
     │     ▼
     │   User must re-issue/afk
     │
     ▼
┌──────────────────────────────┐
│ Reconnected Successfully     │
│ Resume silent audio playback │
└──────────────────────────────┘
```

---

## Memory Management

```
Key Data Structures:

┌─────────────────────────────────────────────┐
│ activeConnections: Map<guildId, Connection>│
├─────────────────────────────────────────────┤
│ Maps Discord guild ID to VoiceConnection   │
│ Purpose: Track which guilds bot is in       │
│ Memory: ~1KB per guild connection           │
│ Example: {                                  │
│   "123456": VoiceConnection {..},           │
│   "789012": VoiceConnection {..}            │
│ }                                           │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ activePlayers: Map<guildId, AudioPlayer>   │
├─────────────────────────────────────────────┤
│ Maps Discord guild ID to audio player      │
│ Purpose: Control playback per guild        │
│ Memory: ~500B per player                   │
│ Example: {                                  │
│   "123456": AudioPlayer {..},               │
│   "789012": AudioPlayer {..}                │
│ }                                           │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ silentAudioBuffer: Buffer (88,200 bytes)   │
├─────────────────────────────────────────────┤
│ Pre-created silent audio (1 second loop)   │
│ Purpose: Reused for all AFK plays          │
│ Memory: 88KB (created once)                │
│ Benefit: No continuous buffer allocation   │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ spotifyToken: String (cached)              │
├─────────────────────────────────────────────┤
│ Spotify API access token                   │
│ Memory: ~1KB                                │
│ TTL: Expires after ~1 hour                 │
│ Auto-refreshed when needed                 │
└─────────────────────────────────────────────┘

Total Memory Usage (baseline):
- discord.js + dependencies: ~20MB
- Node.js overhead: ~30MB
- Active connection per guild: ~2MB
- Bot running idle: ~50-80MB
```

---

## Performance Characteristics

```
┌──────────────────────┬───────────────────────┐
│ Metric               │ Value                 │
├──────────────────────┼───────────────────────┤
│ Base Memory          │ 50MB                  │
│ Per Guild (with bot) │ +2MB                  │
│ Silent Audio Buffer  │ 88KB                  │
│ Network Idle         │ ~1KB/min (heartbeat)  │
│ Network Voice Active │ ~20KB/sec (RTP)       │
│ CPU Idle             │ <1%                   │
│ CPU on Command       │ <5%                   │
│ Startup Time         │ 3-5 seconds           │
│ Command Latency      │ <100ms                │
│ Connection Timeout   │ 5 seconds             │
│ Spotify API RateLimit│ 429 responses handled │
└──────────────────────┴───────────────────────┘
```

---

## Deployment Comparison

```
┌────────────────────────────────────────────────────┐
│ LOCAL (Windows/Mac/Linux)                         │
├────────────────────────────────────────────────────┤
│ Pros:                                              │
│ ✓ Easy to test and debug                           │
│ ✓ See logs in real-time                            │
│ ✓ Modify code easily                               │
│                                                     │
│ Cons:                                              │
│ ✗ Must keep terminal open                          │
│ ✗ Offline when computer sleeps                     │
│ ✗ No auto-restart                                  │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│ VPS (Debian 12+) ⭐ RECOMMENDED                     │
├────────────────────────────────────────────────────┤
│ Pros:                                              │
│ ✓ 24/7 uptime                                      │
│ ✓ Auto-restart on crash                            │
│ ✓ Auto-start on reboot                             │
│ ✓ Professional hosting                             │
│ ✓ Low cost ($3-5/month)                            │
│                                                     │
│ Cons:                                              │
│ ✗ Requires SSH knowledge                           │
│ ✗ Need different credentials setup                 │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│ DOCKER                                             │
├────────────────────────────────────────────────────┤
│ Pros:                                              │
│ ✓ Portable across machines                         │
│ ✓ Reproducible environment                         │
│ ✓ Easy scaling                                     │
│ ✓ Cloud deployment                                 │
│                                                     │
│ Cons:                                              │
│ ✗ Docker overhead (~20MB extra)                    │
│ ✗ Slightly more complex setup                      │
│ ✗ Logs harder to access directly                   │
└────────────────────────────────────────────────────┘
```

---

**These diagrams help you understand how the bot works internally. For implementation details, see [ADVANCED.md](ADVANCED.md).**
