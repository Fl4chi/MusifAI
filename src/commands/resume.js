import { SlashCommandBuilder } from 'discord.js';
import musicManager from '../musicManager.js';

export default {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Riprende la riproduzione'),

    async execute(interaction) {
        const guildId = interaction.guild.id;
        const node = musicManager.shoukaku.getNode();
        const player = node?.players.get(guildId);

        if (!player) return interaction.reply('❌ Nessuna musica in riproduzione.');

        player.setPaused(false);
        interaction.reply('▶️ Riproduzione ripresa.');
    }
};
