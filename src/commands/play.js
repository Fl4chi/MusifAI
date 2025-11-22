import { SlashCommandBuilder } from 'discord.js';
import musicManager from '../musicManager.js';
import logger from '../utils/logger.js';

export default {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Riproduce una canzone da YouTube o Spotify')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Titolo della canzone o link')
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply();
        const query = interaction.options.getString('query');
        const guildId = interaction.guild.id;
        const member = interaction.member;
        const voiceChannel = member.voice.channel;

        if (!voiceChannel) {
            return interaction.editReply('❌ Devi essere in un canale vocale!');
        }

        logger.cmd('play', member.user.tag, interaction.guild.name);

        try {
            let trackToPlay;

            // Check if Spotify link or query
            if (query.includes('spotify.com')) {
                // Handle Spotify logic (simplified for now, just search metadata on YT)
                // In a real app, parse ID, fetch metadata, search YT
                return interaction.editReply('⚠️ Supporto Spotify diretto in arrivo. Usa titolo e artista per ora.');
            }

            // Search on YouTube via Lavalink
            const searchRes = await musicManager.search(query, 'yt');

            if (!searchRes || searchRes.tracks.length === 0) {
                // Fallback: Try searching with "audio" appended or different source
                return interaction.editReply('❌ Nessun risultato trovato.');
            }

            trackToPlay = searchRes.tracks[0];

            // Add to queue
            const queueLength = await musicManager.addToQueue(guildId, trackToPlay);

            // If player is not playing, start playback
            const node = musicManager.shoukaku.getNode();
            const player = node.players.get(guildId);

            if (!player) {
                await musicManager.play(guildId, voiceChannel.id, trackToPlay);
                interaction.editReply(`▶️ In riproduzione: **${trackToPlay.info.title}**`);
            } else {
                interaction.editReply(`✅ Aggiunto alla coda: **${trackToPlay.info.title}** (Posizione: ${queueLength})`);
            }

        } catch (error) {
            logger.error('Play Command Error', error);
            interaction.editReply('❌ Errore durante la riproduzione.');
        }
    }
};
