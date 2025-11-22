import { SlashCommandBuilder } from 'discord.js';
import musicManager from '../musicManager.js';
import logger from '../utils/logger.js';

export default {
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Rimuove una canzone dalla coda')
        .addIntegerOption(option =>
            option.setName('position')
                .setDescription('Posizione della canzone da rimuovere')
                .setMinValue(1)
                .setRequired(true)),

    async execute(interaction) {
        const guildId = interaction.guild.id;
        const position = interaction.options.getInteger('position');
        const queue = await musicManager.getQueue(guildId);

        if (queue.length === 0) {
            return interaction.reply('❌ La coda è vuota.');
        }

        if (position > queue.length) {
            return interaction.reply(`❌ Posizione non valida. La coda ha solo ${queue.length} brani.`);
        }

        const removed = queue.splice(position - 1, 1)[0];
        await musicManager.saveQueue(guildId, queue);

        logger.cmd('remove', interaction.user.tag, interaction.guild.name);
        interaction.reply(`🗑️ Rimosso: **${removed.info.title}**`);
    }
};
