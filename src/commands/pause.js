import { SlashCommandBuilder } from 'discord.js';
import musicManager from '../musicManager.js';

export default {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Mette in pausa la riproduzione'),

    async execute(interaction) {
        const guildId = interaction.guild.id;
        const node = musicManager.shoukaku.getNode();
        const player = node?.players.get(guildId);

        if (!player) return interaction.reply('❌ Nessuna musica in riproduzione.');

        player.setPaused(true);
        interaction.reply('⏸️ Musica in pausa.');
    }
};
