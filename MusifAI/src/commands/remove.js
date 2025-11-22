import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
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
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setDescription('❌ **La coda è vuota.**');
            return interaction.reply({ embeds: [embed] });
        }

        if (position > queue.length) {
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setDescription(`❌ **Posizione non valida.** La coda ha solo ${queue.length} brani.`);
            return interaction.reply({ embeds: [embed] });
        }

        const removed = queue.splice(position - 1, 1)[0];
        await musicManager.saveQueue(guildId, queue);

        logger.cmd('remove', interaction.user.tag, interaction.guild.name);

        const embed = new EmbedBuilder()
            .setColor(0xE67E22)
            .setTitle('🗑️ Brano rimosso')
            .setDescription(`**${removed.info.title}** è stato rimosso dalla coda.`)
            .setFooter({ text: `Comando usato da ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

        interaction.reply({ embeds: [embed] });
    }
};
