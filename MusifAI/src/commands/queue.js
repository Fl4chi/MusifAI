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
            const embed = new EmbedBuilder()
                .setColor(0x95A5A6)
                .setTitle('📭 Coda vuota')
                .setDescription('Non ci sono brani in coda. Usa `/play` per aggiungerne!');
            return interaction.reply({ embeds: [embed] });
        }

        const queueList = queue.slice(0, 10).map((track, i) =>
            `**${i + 1}.** ${track.info.title}\n⏱️ \`${Math.floor(track.info.length / 60000)}:${String(Math.floor((track.info.length % 60000) / 1000)).padStart(2, '0')}\``
        ).join('\n\n');

        const embed = new EmbedBuilder()
            .setTitle(`🎶 Coda di riproduzione`)
            .setColor(0x9B59B6)
            .setDescription(queueList)
            .setFooter({ text: `${queue.length} brani totali in coda` });

        if (queue.length > 10) {
            embed.setFooter({ text: `Mostrati 10 di ${queue.length} brani` });
        }

        interaction.reply({ embeds: [embed] });
    }
};
