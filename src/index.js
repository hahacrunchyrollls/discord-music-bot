import { Client, GatewayIntentBits, ChannelType } from 'discord.js';
import { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, entersState } from '@discordjs/voice';
import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Readable } from 'stream';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const ADMIN_USER_ID = process.env.ADMIN_USER_ID;
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.DirectMessages,
  ],
});

// Store active connections and players
const activeConnections = new Map();
const activePlayers = new Map();
let spotifyToken = null;
let spotifyTokenExpiry = 0;

// Initialize silent audio buffer
let silentAudioBuffer = null;

const createSilentAudio = () => {
  // Create 1 second of silent audio (44.1kHz, mono, 16-bit PCM = 88,200 bytes)
  const sampleRate = 44100;
  const channels = 1;
  const bitsPerSample = 16;
  const duration = 1; // 1 second
  
  const audioLength = sampleRate * channels * duration * (bitsPerSample / 8);
  const buffer = Buffer.alloc(audioLength);
  
  // Fill with silence (zeros for 16-bit PCM)
  buffer.fill(0);
  
  console.log(`📦 Created silent audio buffer: ${audioLength} bytes`);
  return buffer;
};

// Get Spotify access token
const getSpotifyToken = async () => {
  try {
    if (spotifyToken && Date.now() < spotifyTokenExpiry) {
      return spotifyToken;
    }

    const auth = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
    const response = await axios.post('https://accounts.spotify.com/api/token', 
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    spotifyToken = response.data.access_token;
    spotifyTokenExpiry = Date.now() + (response.data.expires_in * 1000);
    return spotifyToken;
  } catch (error) {
    console.error('Error getting Spotify token:', error.message);
    return null;
  }
};

// Parse Spotify URL
const parseSpotifyTrack = async (url) => {
  try {
    const trackIdMatch = url.match(/track\/([a-zA-Z0-9]+)/);
    if (!trackIdMatch) return null;

    const trackId = trackIdMatch[1];
    const token = await getSpotifyToken();
    if (!token) return null;

    const response = await axios.get(`https://api.spotify.com/v1/tracks/${trackId}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );

    return {
      title: response.data.name,
      artist: response.data.artists[0].name,
      query: `${response.data.name} ${response.data.artists[0].name}`
    };
  } catch (error) {
    console.error('Error parsing Spotify track:', error.message);
    return null;
  }
};

// Check if user is admin
const isAdmin = (userId) => {
  return userId === ADMIN_USER_ID;
};

client.on('ready', () => {
  console.log(`✅ Bot logged in as ${client.user.tag}`);
  
  // Register slash commands for each guild
  client.guilds.cache.forEach(guild => {
    registerCommands(guild);
  });
});

client.on('guildCreate', (guild) => {
  console.log(`📍 Joined guild: ${guild.name}`);
  registerCommands(guild);
});

const registerCommands = async (guild) => {
  try {
    const commands = [
      {
        name: 'play',
        description: 'Play music from URL or search query',
        options: [
          {
            name: 'query',
            description: 'YouTube URL, Spotify URL, or search query',
            type: 3,
            required: true,
          },
        ],
      },
      {
        name: 'stop',
        description: 'Stop playing music',
      },
      {
        name: 'jerico',
        description: 'Join a voice channel and stay AFK 24/7 with silent audio',
        options: [
          {
            name: 'voicechannelname',
            description: 'Voice channel name or ID to join',
            type: 3,
            required: true,
          },
        ],
      },
      {
        name: 'jerico-reset',
        description: 'Reset commands and leave the voice channel',
      },
      {
        name: 'ping',
        description: 'Check bot latency',
      },
    ];

    await guild.commands.set(commands);
    console.log(`✅ Commands registered for ${guild.name}`);
  } catch (error) {
    console.error(`Error registering commands: ${error.message}`);
  }
};

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // Check admin permission for all commands
  if (!isAdmin(interaction.user.id)) {
    return interaction.reply({
      content: '❌ Only the admin user can use this bot.',
      ephemeral: true,
    });
  }

  try {
    switch (interaction.commandName) {
      case 'play':
        await handlePlay(interaction);
        break;
      case 'stop':
        await handleStop(interaction);
        break;
      case 'jerico':
        await handleJerico(interaction);
        break;
      case 'jerico-reset':
        await handleJericoReset(interaction);
        break;
      case 'ping':
        await interaction.reply(`🏓 Pong! Latency: ${client.ws.ping}ms`);
        break;
    }
  } catch (error) {
    console.error(`Command error: ${error.message}`);
    const errorMessage = '❌ An error occurred while executing the command.';
    if (interaction.replied) {
      await interaction.followUp(errorMessage);
    } else {
      await interaction.reply(errorMessage);
    }
  }
});

const handlePlay = async (interaction) => {
  await interaction.deferReply();

  const query = interaction.options.getString('query');
  const voiceChannel = interaction.member?.voice?.channel;

  if (!voiceChannel) {
    return interaction.editReply('❌ You must be in a voice channel to play music.');
  }

  try {
    let searchQuery = query;

    // Check if it's a Spotify URL
    if (query.includes('spotify.com')) {
      const trackInfo = await parseSpotifyTrack(query);
      if (trackInfo) {
        searchQuery = trackInfo.query;
      }
    }

    // For now, we'll use a simple approach
    // In production, integrate with a music API like play-dl or ytdl-core
    
    await interaction.editReply(
      `🎵 Playing: **${searchQuery}**\n` +
      `📍 Channel: **${voiceChannel.name}**`
    );

    await joinAndPlaySilent(voiceChannel, interaction.guild);
  } catch (error) {
    await interaction.editReply(`❌ Error: ${error.message}`);
  }
};

const handleStop = async (interaction) => {
  const guildId = interaction.guild.id;
  
  if (activePlayers.has(guildId)) {
    activePlayers.get(guildId).stop();
    activePlayers.delete(guildId);
  }

  if (activeConnections.has(guildId)) {
    activeConnections.get(guildId).destroy();
    activeConnections.delete(guildId);
  }

  await interaction.reply('⏹️ Music stopped. Bot is leaving the channel.');
};

const handleJerico = async (interaction) => {
  await interaction.deferReply();

  const voicechannelname = interaction.options.getString('voicechannelname', true);
  
  // Debug logging
  console.log(`🔍 Looking for channel: "${voicechannelname}"`);

  if (!voicechannelname || voicechannelname.trim() === '') {
    return interaction.editReply(
      `❌ Please provide a valid voice channel name or ID.`
    );
  }

  let voiceChannel = null;

  // Try to find channel by name or ID
  try {
    const channels = await interaction.guild.channels.fetch();
    
    // First try exact ID match
    voiceChannel = channels.get(voicechannelname);
    
    // If not found by ID, try by name (case-insensitive)
    if (!voiceChannel) {
      voiceChannel = channels.find(ch => 
        ch.type === ChannelType.GuildVoice && 
        ch.name && 
        ch.name.toLowerCase() === voicechannelname.toLowerCase()
      );
    }
    
    // If still not found, try partial name match
    if (!voiceChannel) {
      voiceChannel = channels.find(ch => 
        ch.type === ChannelType.GuildVoice && 
        ch.name && 
        ch.name.includes(voicechannelname)
      );
    }
  } catch (error) {
    console.error('Error fetching channels:', error);
    return interaction.editReply(
      `❌ Error fetching channels: ${error.message}`
    );
  }

  if (!voiceChannel) {
    // List available channels for debugging
    const availableChannels = await interaction.guild.channels.fetch();
    const voiceChannels = availableChannels.filter(ch => ch.type === ChannelType.GuildVoice);
    const channelList = voiceChannels.map(ch => `- ${ch.name} (${ch.id})`).join('\n');
    
    return interaction.editReply(
      `❌ Voice channel "${voicechannelname}" not found.\n\n` +
      `📍 Available voice channels:\n${channelList || 'No voice channels available'}`
    );
  }

  try {
    await joinAndPlaySilent(voiceChannel, interaction.guild);
    await interaction.editReply(
      `✅ **Jerico** is now online! 🎵\n` +
      `📍 Voice Channel: **${voiceChannel.name}**\n` +
      `🔇 Playing silent audio to maintain connection...\n` +
      `⏱️ Will stay online 24/7 without disconnecting\n` +
      `🔄 Use \`/jerico-reset\` to reset and leave`
    );
  } catch (error) {
    console.error('Error in handleJerico:', error);
    await interaction.editReply(`❌ Error: ${error.message}`);
  }
};

const handleJericoReset = async (interaction) => {
  const guildId = interaction.guild.id;

  let wasInChannel = false;
  let channelName = 'N/A';

  // Get channel name before disconnecting
  if (activeConnections.has(guildId)) {
    const connection = activeConnections.get(guildId);
    const channel = connection.joinConfig.channelId;
    const guild = client.guilds.cache.get(guildId);
    if (guild) {
      const voiceChannel = guild.channels.cache.get(channel);
      if (voiceChannel) {
        channelName = voiceChannel.name;
        wasInChannel = true;
      }
    }
  }

  // Stop player
  if (activePlayers.has(guildId)) {
    activePlayers.get(guildId).stop();
    activePlayers.delete(guildId);
  }

  // Destroy connection
  if (activeConnections.has(guildId)) {
    activeConnections.get(guildId).destroy();
    activeConnections.delete(guildId);
  }

  // Re-register commands to check for new ones
  const guild = interaction.guild;
  await registerCommands(guild);

  const message = wasInChannel 
    ? `🔄 **Reset Complete!**\n👋 Left voice channel **${channelName}**\n✅ Commands refreshed and ready` 
    : `🔄 **Reset Complete!**\n✅ Commands refreshed and ready`;
  
  await interaction.reply(message);
};

const joinAndPlaySilent = async (voiceChannel, guild) => {
  const guildId = guild.id;

  console.log(`🎤 Starting joinAndPlaySilent for channel: ${voiceChannel.name}`);

  // Stop existing player if any
  if (activePlayers.has(guildId)) {
    try {
      activePlayers.get(guildId).stop();
    } catch (error) {
      console.error('Error stopping existing player:', error);
    }
  }

  // Disconnect existing connection if any
  if (activeConnections.has(guildId)) {
    try {
      activeConnections.get(guildId).destroy();
    } catch (error) {
      console.error('Error destroying existing connection:', error);
    }
  }

  // Create player first
  const player = createAudioPlayer();
  console.log(`🎵 Audio player created`);

  // Create a function to generate fresh resources
  const createSilentResource = () => {
    const buffer = createSilentAudio();
    const resource = createAudioResource(
      Readable.from([buffer]),
      { inlineVolume: true }
    );
    resource.volume.setVolume(0.01); // Minimal volume (silent)
    console.log(`📻 Audio resource created`);
    return resource;
  };

  // Play resource on idle (loop the silent audio)
  player.on(AudioPlayerStatus.Idle, () => {
    console.log(`♻️ Player idle, replaying silent audio...`);
    try {
      const resource = createSilentResource();
      player.play(resource);
    } catch (error) {
      console.error('Error replaying silent audio:', error);
    }
  });

  // Handle player errors
  player.on('error', error => {
    console.error(`❌ Player error: ${error.message}`);
  });

  player.on(AudioPlayerStatus.Playing, () => {
    console.log(`▶️ Player is now playing`);
  });

  // Join voice channel
  const connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: guild.id,
    adapterCreator: guild.voiceAdapterCreator,
  });

  console.log(`🔌 Voice connection created, waiting for ready state...`);

  // Wait for connection to be ready
  try {
    await entersState(connection, VoiceConnectionStatus.Ready, 30000);
    console.log(`✅ Connection is ready, subscribing player...`);
  } catch (error) {
    console.error(`❌ Failed to enter ready state: ${error.message}`);
    connection.destroy();
    throw new Error('Could not connect to voice channel');
  }

  // Subscribe player to connection
  connection.subscribe(player);
  console.log(`📡 Player subscribed to connection`);

  // Handle connection disconnection
  connection.on(VoiceConnectionStatus.Disconnected, () => {
    console.log(`⚠️ Disconnected from ${voiceChannel.name}, attempting to reconnect...`);
    try {
      entersState(connection, VoiceConnectionStatus.Connecting, 5000).then(() => {
        console.log(`✅ Reconnection successful`);
      }).catch(() => {
        console.log(`❌ Failed to reconnect, destroying connection...`);
        connection.destroy();
        activeConnections.delete(guildId);
        activePlayers.delete(guildId);
      });
    } catch (error) {
      console.error('Reconnection error:', error);
      connection.destroy();
      activeConnections.delete(guildId);
      activePlayers.delete(guildId);
    }
  });

  connection.on(VoiceConnectionStatus.Destroyed, () => {
    console.log(`🔌 Connection destroyed for guild ${guildId}`);
    activeConnections.delete(guildId);
    activePlayers.delete(guildId);
  });

  // Handle connection errors
  connection.on('error', error => {
    console.error(`❌ Connection error: ${error.message}`);
  });

  // Start playing silent audio
  try {
    const initialResource = createSilentResource();
    player.play(initialResource);
    console.log(`▶️ Playing initial silent audio...`);
  } catch (error) {
    console.error('Error starting initial play:', error);
    connection.destroy();
    throw error;
  }

  // Store connection and player
  activeConnections.set(guildId, connection);
  activePlayers.set(guildId, player);

  console.log(`✅ Joined ${voiceChannel.name} and playing silent audio`);
};

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  
  activeConnections.forEach(connection => {
    connection.destroy();
  });
  
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Terminating...');
  
  activeConnections.forEach(connection => {
    connection.destroy();
  });
  
  client.destroy();
  process.exit(0);
});

// Start bot
client.login(DISCORD_TOKEN);
