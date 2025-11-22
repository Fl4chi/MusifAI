import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
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
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setDescription('❌ **Devi essere in un canale vocale per usare questo comando!**');
            return interaction.editReply({ embeds: [embed] });
        }

        logger.cmd('play', member.user.tag, interaction.guild.name);

        try {
            let trackToPlay;

            if (query.includes('spotify.com')) {
                const embed = new EmbedBuilder()
                    .setColor(0xFFA500)
                    .setDescription('⚠️ Supporto link Spotify in arrivo. Usa **titolo e artista** per ora.');
                return interaction.editReply({ embeds: [embed] });
            }

            const searchRes = await musicManager.search(query, 'yt');

            if (!searchRes || searchRes.tracks.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setDescription('❌ **Nessun risultato trovato per:** `' + query + '`');
                return interaction.editReply({ embeds: [embed] });
            }

            trackToPlay = searchRes.tracks[0];
            const queueLength = await musicManager.addToQueue(guildId, trackToPlay);
            const node = musicManager.shoukaku.getNode();
            const player = node.players.get(guildId);

            if (!player) {
                await musicManager.play(guildId, voiceChannel.id, trackToPlay);

                const embed = new EmbedBuilder()
                    .setColor(0x00FF00)
                    .setTitle('▶️ In riproduzione')
                    .setDescription(`**${trackToPlay.info.title}**`)
                    .addFields(
                        { name: '📝 Autore', value: trackToPlay.info.author || 'Sconosciuto', inline: true },
                        { name: '⏱️ Durata', value: `${Math.floor(trackToPlay.info.length / 60000)}:${String(Math.floor((trackToPlay.info.length % 60000) / 1000)).padStart(2, '0')}`, inline: true }
                    )
                    .setThumbnail(trackToPlay.info.artworkUrl || 'https://via.placeholder.com/150')
                    .setFooter({ text: `Richiesto da ${member.user.username}`, iconURL: member.user.displayAvatarURL() });

                interaction.editReply({ embeds: [embed] });
            } else {
                const embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle('✅ Aggiunto alla coda')
                    .setDescription(`**${trackToPlay.info.title}**`)
                    .addFields(
                        { name: '📍 Posizione', value: `#${queueLength}`, inline: true },
                        { name: '⏱️ Durata', value: `${Math.floor(trackToPlay.info.length / 60000)}:${String(Math.floor((trackToPlay.info.length % 60000) / 1000)).padStart(2, '0')}`, inline: true }
                    )
                    .setThumbnail(trackToPlay.info.artworkUrl || 'https://via.placeholder.com/150')
                    .setFooter({ text: `Richiesto da ${member.user.username}`, iconURL: member.user.displayAvatarURL() });

                interaction.editReply({ embeds: [embed] });
            }

        } catch (error) {
            logger.error('Play Command Error', error);
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setDescription('❌ **Errore durante la riproduzione**\nRiprova tra qualche secondo.');
            interaction.editReply({ embeds: [embed] });
        }
    }
};
