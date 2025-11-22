import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import musicManager from '../musicManager.js';

export default {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Riprende la riproduzione'),

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

        player.setPaused(false);

        const embed = new EmbedBuilder()
            .setColor(0x2ECC71)
            .setTitle('▶️ Riproduzione ripresa')
            .setDescription('La musica è stata ripresa!')
            .setFooter({ text: `Comando usato da ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

        interaction.reply({ embeds: [embed] });
    }
};
