import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
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
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setDescription('❌ **La coda è vuota. Aggiungi brani con `/play`!**');
            return interaction.reply({ embeds: [embed] });
        }

        // Fisher-Yates shuffle
        for (let i = queue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [queue[i], queue[j]] = [queue[j], queue[i]];
        }

        await musicManager.saveQueue(guildId, queue);
        logger.cmd('shuffle', interaction.user.tag, interaction.guild.name);

        const embed = new EmbedBuilder()
            .setColor(0xE74C3C)
            .setTitle('🔀 Coda mescolata')
            .setDescription(`La coda è stata mescolata! **${queue.length}** brani in ordine casuale.`)
            .setFooter({ text: `Comando usato da ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

        interaction.reply({ embeds: [embed] });
    }
};
