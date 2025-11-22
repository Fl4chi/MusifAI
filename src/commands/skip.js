import { SlashCommandBuilder } from 'discord.js';
import musicManager from '../musicManager.js';
import logger from '../utils/logger.js';

export default {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Salta al prossimo brano'),

    async execute(interaction) {
        const guildId = interaction.guild.id;
        const node = musicManager.shoukaku.getNode();
        const player = node?.players.get(guildId);

        if (!player) {
            return interaction.reply('❌ Nessuna musica in riproduzione.');
        }

        player.stopTrack(); // This triggers the 'end' event which handles next track

        logger.cmd('skip', interaction.user.tag, interaction.guild.name);
        interaction.reply('⏭️ Brano saltato.');
    }
};
