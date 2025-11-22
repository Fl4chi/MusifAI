import { Shoukaku, Connectors } from 'shoukaku';
import { createClient } from 'redis';
import logger from './utils/logger.js';
import axios from 'axios';

class MusicManager {
  constructor() {
    this.shoukaku = null;
    this.redis = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    this.redis.on('error', (err) => logger.error('Redis Client Error', err));
    this.redis.connect().catch(err => logger.warn('Redis connection failed, falling back to memory', err));

    this.queues = new Map(); // Fallback memory queue
  }

  async init(client) {
    const Nodes = [{
      name: 'Localhost',
      url: `${process.env.LAVALINK_HOST}:${process.env.LAVALINK_PORT}`,
      auth: process.env.LAVALINK_PASSWORD
    }];

    this.shoukaku = new Shoukaku(new Connectors.DiscordJS(client), Nodes);

    this.shoukaku.on('error', (_, error) => logger.error('Lavalink Error', error));
    this.shoukaku.on('ready', (name) => logger.success(`Lavalink Node ${name} is ready`));
    this.shoukaku.on('close', (name, code, reason) => logger.warn(`Lavalink Node ${name} closed: ${code} ${reason}`));
    this.shoukaku.on('disconnect', (name) => logger.warn(`Lavalink Node ${name} disconnected`));
  }

  async getQueue(guildId) {
    if (this.redis.isOpen) {
      const data = await this.redis.get(`queue:${guildId}`);
      return data ? JSON.parse(data) : [];
    }
    return this.queues.get(guildId) || [];
  }

  async saveQueue(guildId, queue) {
    if (this.redis.isOpen) {
      await this.redis.set(`queue:${guildId}`, JSON.stringify(queue));
    } else {
      this.queues.set(guildId, queue);
    }
  }

  async addToQueue(guildId, track) {
    const queue = await this.getQueue(guildId);
    queue.push(track);
    await this.saveQueue(guildId, queue);
    return queue.length;
  }

  async getNextTrack(guildId) {
    const queue = await this.getQueue(guildId);
    const track = queue.shift();
    await this.saveQueue(guildId, queue);
    return track;
  }

  async clearQueue(guildId) {
    if (this.redis.isOpen) {
      await this.redis.del(`queue:${guildId}`);
    } else {
      this.queues.delete(guildId);
    }
  }

  async search(query, type = 'yt') {
    const node = this.shoukaku.getNode();
    if (!node) throw new Error('No Lavalink node available');

    const result = await node.rest.resolve(type === 'yt' ? `ytsearch:${query}` : query);
    return result;
  }

  async searchSpotify(query) {
    try {
      const token = await this.getSpotifyToken();
      const res = await axios.get(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.tracks.items.length > 0) {
        const track = res.data.tracks.items[0];
        return {
          title: track.name,
          artist: track.artists[0].name,
          thumbnail: track.album.images[0]?.url,
          uri: track.external_urls.spotify
        };
      }
      return null;
    } catch (e) {
      logger.error('Spotify Search Error', e);
      return null;
    }
  }

  async getSpotifyToken() {
    // Simple token fetch, ideally cache this
    const res = await axios.post('https://accounts.spotify.com/api/token',
      'grant_type=client_credentials', {
      headers: {
        'Authorization': 'Basic ' + (Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64')),
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    return res.data.access_token;
  }

  async play(guildId, voiceChannelId, track) {
    const node = this.shoukaku.getNode();
    if (!node) throw new Error('No Lavalink node available');

    const player = await node.joinChannel({
      guildId: guildId,
      channelId: voiceChannelId,
      shardId: 0 // Assuming single shard for now
    });

    player.playTrack({ track: track.track });

    player.on('end', async () => {
      const nextTrack = await this.getNextTrack(guildId);
      if (nextTrack) {
        // Resolve the track string again if needed or store full track obj
        // For simplicity assuming we stored the full track object from Lavalink
        player.playTrack({ track: nextTrack.track });
        logger.player(guildId, `Playing next track: ${nextTrack.info.title}`);
      } else {
        player.stopTrack();
        // Optional: leave channel after timeout
        logger.player(guildId, 'Queue finished');
      }
    });

    return player;
  }
}

export default new MusicManager();
