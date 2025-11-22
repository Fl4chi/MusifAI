import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import musicManager from '../musicManager.js';
import logger from '../utils/logger.js';

export default {
    data: new SlashCommandBuilder()
        .setName('search')
        .setDescription('Cerca brani su YouTube e Spotify')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Titolo o artista')
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply();
        const query = interaction.options.getString('query');

        try {
            // Search on YouTube
            const ytResults = await musicManager.search(query, 'yt');

            // Search on Spotify (metadata only)
            const spotifyResult = await musicManager.searchSpotify(query);

            const embed = new EmbedBuilder()
                .setTitle(`🔍 Risultati per: ${query}`)
                .setColor(0x1DB954);

            if (ytResults && ytResults.tracks.length > 0) {
                const ytTop = ytResults.tracks.slice(0, 5).map((t, i) =>
                    `**${i + 1}.** ${t.info.title} - \`${Math.floor(t.info.length / 60000)}:${String(Math.floor((t.info.length % 60000) / 1000)).padStart(2, '0')}\``
                ).join('\n');
                embed.addFields({ name: '🎥 YouTube', value: ytTop });
            }

            if (spotifyResult) {
                embed.addFields({
                    name: '🎵 Spotify (Top Result)',
                    value: `**${spotifyResult.title}** - ${spotifyResult.artist}`
                });
                if (spotifyResult.thumbnail) {
                    embed.setThumbnail(spotifyResult.thumbnail);
                }
            }

            logger.cmd('search', interaction.user.tag, interaction.guild.name);
            interaction.editReply({ embeds: [embed] });

        } catch (error) {
            logger.error('Search Command Error', error);
            interaction.editReply('❌ Errore durante la ricerca.');
        }
    }
};
