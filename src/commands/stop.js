import { SlashCommandBuilder } from 'discord.js';
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
            return interaction.reply('❌ Nessuna musica in riproduzione.');
        }

        await musicManager.clearQueue(guildId);
        player.stopTrack();
        node.leaveChannel(guildId);

        logger.cmd('stop', interaction.user.tag, interaction.guild.name);
        interaction.reply('🛑 Musica fermata e coda svuotata.');
    }
};
