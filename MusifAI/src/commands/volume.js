import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
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
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setDescription('❌ **Nessuna musica in riproduzione.**');
            return interaction.reply({ embeds: [embed] });
        }

        player.setGlobalVolume(level);

        let emoji = '🔇';
        if (level > 0 && level <= 33) emoji = '🔉';
        else if (level > 33 && level <= 66) emoji = '🔊';
        else if (level > 66) emoji = '📢';

        const embed = new EmbedBuilder()
            .setColor(0x3498DB)
            .setTitle(`${emoji} Volume impostato`)
            .setDescription(`Il volume è stato impostato a **${level}%**`)
            .setFooter({ text: `Comando usato da ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

        interaction.reply({ embeds: [embed] });
    }
};
