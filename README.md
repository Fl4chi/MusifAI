# MusifAI - Discord Music Bot 🎵

Bot musicale avanzato per Discord con supporto Lavalink, Spotify e YouTube.

## 🚀 Caratteristiche

- ✅ Slash Commands moderni
- 🎵 Riproduzione da YouTube tramite Lavalink
- 🎧 Metadata da Spotify API
- 💾 Persistenza code con Redis
- 🔄 Gestione automatica fallback
- 🌐 Multi-server support
- 📊 Console logging completa

## 📋 Requisiti

- Node.js v18+
- Lavalink Server
- Redis Server (opzionale, fallback in memoria)
- Discord Bot Token
- Spotify API Credentials

## 🔧 Setup

### 1. Installazione dipendenze

```bash
npm install
```

### 2. Configurazione

Copia `.env.example` in `.env` e compila i valori:

```env
DISCORD_TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_client_id
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
REDIS_URL=redis://localhost:6379
LAVALINK_HOST=localhost
LAVALINK_PORT=2333
LAVALINK_PASSWORD=youshallnotpass
```

### 3. Avvio Lavalink

Scarica Lavalink da [qui](https://github.com/lavalink-devs/Lavalink/releases) e avvialo:

```bash
java -jar Lavalink.jar
```

### 4. Deploy comandi

```bash
npm run deploy
```

### 5. Avvia il bot

```bash
npm start
```

## 🎮 Comandi

- `/play <query>` - Riproduce una canzone
- `/pause` - Pausa la riproduzione
- `/resume` - Riprende la riproduzione
- `/skip` - Salta al prossimo brano
- `/stop` - Ferma la musica e svuota la coda
- `/queue` - Mostra la coda
- `/volume <0-100>` - Imposta il volume
- `/shuffle` - Mescola la coda
- `/remove <posizione>` - Rimuove un brano dalla coda
- `/search <query>` - Cerca brani su YouTube e Spotify

## 📝 License

MIT

## 👤 Author

Fl4chi
