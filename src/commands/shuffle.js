import { SlashCommandBuilder } from 'discord.js';
import musicManager from '../musicManager.js';
import logger from '../utils/logger.js';

export default {
    data: new SlashCommandBuilder()
        .setName('shuffle')
        .setDescription('Mescola la coda di riproduzione'),

    async execute(interaction) {
        const guildId = interaction.guild.id;
        const queue = await musicManager.getQueue(guildId);

        if (queue.length === 0) {
            return interaction.reply('❌ La coda è vuota.');
        }

        // Fisher-Yates shuffle
        for (let i = queue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [queue[i], queue[j]] = [queue[j], queue[i]];
        }

        await musicManager.saveQueue(guildId, queue);
        logger.cmd('shuffle', interaction.user.tag, interaction.guild.name);
        interaction.reply(`🔀 Coda mescolata! **${queue.length}** brani.`);
    }
};
