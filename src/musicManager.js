import axios from 'axios';
import ytSearch from 'yt-search';

// Music Manager for handling Lavalink connections
class MusicManager {
  constructor() {
    this.players = new Map();
    this.queues = new Map();
    this.lavaliinkHost = process.env.LAVALINK_HOST || 'localhost';
    this.lavaliinkPort = process.env.LAVALINK_PORT || 2333;
    this.lavaliinkPassword = process.env.LAVALINK_PASSWORD || 'youshallnotpass';
  }

  getPlayer(guildId) {
    return this.players.get(guildId);
  }

  getQueue(guildId) {
    if (!this.queues.has(guildId)) {
      this.queues.set(guildId, []);
    }
    return this.queues.get(guildId);
  }

  addToQueue(guildId, track) {
    this.getQueue(guildId).push(track);
  }

  removeFromQueue(guildId, index) {
    const queue = this.getQueue(guildId);
    if (index >= 0 && index < queue.length) {
      queue.splice(index, 1);
      return true;
    }
    return false;
  }

  shuffleQueue(guildId) {
    const queue = this.getQueue(guildId);
    for (let i = queue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [queue[i], queue[j]] = [queue[j], queue[i]];
    }
  }

  clearQueue(guildId) {
    this.queues.set(guildId, []);
  }

  // Search for tracks on YouTube
  async searchYouTube(query) {
    try {
      const result = await ytSearch(query);
      return result.videos.slice(0, 10).map(video => ({
        title: video.title,
        artist: video.author.name,
        url: video.url,
        duration: video.seconds,
        thumbnail: video.thumbnail,
        source: 'YouTube',
      }));
    } catch (error) {
      console.error('❌ Errore ricerca YouTube:', error);
      return [];
    }
  }

  // Search for tracks on Spotify (metadata only)
  async searchSpotify(query) {
    try {
      const accessToken = await this.getSpotifyToken();
      const response = await axios.get('https://api.spotify.com/v1/search', {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { q: query, type: 'track', limit: 10 },
      });

      return response.data.tracks.items.map(track => ({
        title: track.name,
        artist: track.artists[0].name,
        albumArt: track.album.images[0]?.url,
        duration: Math.floor(track.duration_ms / 1000),
        source: 'Spotify',
        externalUrl: track.external_urls.spotify,
      }));
    } catch (error) {
      console.error('❌ Errore ricerca Spotify:', error);
      return [];
    }
  }

  // Get Spotify access token
  async getSpotifyToken() {
    try {
      const response = await axios.post(
        'https://accounts.spotify.com/api/token',
        'grant_type=client_credentials',
        {
          headers: {
            Authorization: `Basic ${Buffer.from(
              `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
            ).toString('base64')}`,
          },
        }
      );
      return response.data.access_token;
    } catch (error) {
      console.error('❌ Errore autenticazione Spotify:', error);
      return null;
    }
  }

  // Play a track via Lavalink
  async playTrack(guildId, voiceChannelId, track) {
    try {
      // Search for the track on Lavalink
      const searchResponse = await axios.get(
        `http://${this.lavaliinkHost}:${this.lavaliinkPort}/loadtracks`,
        {
          headers: { Authorization: this.lavaliinkPassword },
          params: { identifier: track.url || `ytsearch:${track.title} ${track.artist}` },
        }
      );

      if (searchResponse.data.tracks.length === 0) {
        return { success: false, error: 'Nessuna traccia trovata' };
      }

      const selectedTrack = searchResponse.data.tracks[0];
      this.addToQueue(guildId, {
        title: track.title,
        artist: track.artist,
        uri: selectedTrack.track,
        duration: selectedTrack.info.length,
      });

      return { success: true, track: selectedTrack };
    } catch (error) {
      console.error('❌ Errore riproduzione traccia:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new MusicManager();
