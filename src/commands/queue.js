import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import musicManager from '../musicManager.js';

export default {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Mostra la coda di riproduzione'),

    async execute(interaction) {
        const guildId = interaction.guild.id;
        const queue = await musicManager.getQueue(guildId);

        if (queue.length === 0) {
            return interaction.reply('📭 La coda è vuota.');
        }

        const embed = new EmbedBuilder()
            .setTitle(`🎶 Coda per ${interaction.guild.name}`)
            .setColor(0x0099FF)
            .setDescription(queue.slice(0, 10).map((track, i) => `**${i + 1}.** ${track.info.title}`).join('\n'));

        if (queue.length > 10) {
            embed.setFooter({ text: `E altre ${queue.length - 10} canzoni...` });
        }

        interaction.reply({ embeds: [embed] });
    }
};
