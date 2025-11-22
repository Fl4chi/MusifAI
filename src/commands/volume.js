import { SlashCommandBuilder } from 'discord.js';
import musicManager from '../musicManager.js';

export default {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Imposta il volume')
        .addIntegerOption(option =>
            option.setName('level')
                .setDescription('Livello volume (0-100)')
                .setMinValue(0)
                .setMaxValue(100)
                .setRequired(true)),

    async execute(interaction) {
        const guildId = interaction.guild.id;
        const level = interaction.options.getInteger('level');
        const node = musicManager.shoukaku.getNode();
        const player = node?.players.get(guildId);

        if (!player) {
            return interaction.reply('❌ Nessuna musica in riproduzione.');
        }

        player.setGlobalVolume(level);
        interaction.reply(`🔊 Volume impostato a **${level}%**`);
    }
};
