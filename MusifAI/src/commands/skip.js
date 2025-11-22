import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
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
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setDescription('❌ **Nessuna musica in riproduzione.**');
            return interaction.reply({ embeds: [embed] });
        }

        player.stopTrack();

        logger.cmd('skip', interaction.user.tag, interaction.guild.name);

        const embed = new EmbedBuilder()
            .setColor(0xFFA500)
            .setTitle('⏭️ Brano saltato')
            .setDescription('Passando al prossimo brano in coda...')
            .setFooter({ text: `Comando usato da ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

        interaction.reply({ embeds: [embed] });
    }
};
