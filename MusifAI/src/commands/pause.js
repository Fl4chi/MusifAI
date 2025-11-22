import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import musicManager from '../musicManager.js';

export default {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Mette in pausa la riproduzione'),

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

        player.setPaused(true);

        const embed = new EmbedBuilder()
            .setColor(0xF39C12)
            .setTitle('⏸️ Musica in pausa')
            .setDescription('La riproduzione è stata messa in pausa. Usa `/resume` per riprendere.')
            .setFooter({ text: `Comando usato da ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

        interaction.reply({ embeds: [embed] });
    }
};
