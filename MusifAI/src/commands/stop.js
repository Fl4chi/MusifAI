import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import musicManager from '../musicManager.js';
import logger from '../utils/logger.js';

export default {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Ferma la musica e svuota la coda'),

    async execute(interaction) {
        const guildId = interaction.guild.id;
        const node = musicManager.shoukaku.getNode();
        const player = node?.players.get(guildId);

        if (!player) {
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setDescription('❌ **Nessuna musica in riproduzione.**');
            return interaction.reply({ embeds: [embed] });
        }

        await musicManager.clearQueue(guildId);
        player.stopTrack();
        node.leaveChannel(guildId);

        logger.cmd('stop', interaction.user.tag, interaction.guild.name);

        const embed = new EmbedBuilder()
            .setColor(0xFF6B6B)
            .setTitle('🛑 Riproduzione fermata')
            .setDescription('La musica è stata fermata e la coda è stata svuotata.')
            .setFooter({ text: `Comando usato da ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

        interaction.reply({ embeds: [embed] });
    }
};
