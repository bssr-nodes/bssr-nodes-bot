const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('icon')
        .setDescription('Fetches the server logo.'),
        
    async execute(interaction) {
        const serverIcon = interaction.guild.iconURL({ dynamic: true, size: 1024 });

        if (!serverIcon) {
            return interaction.reply({ content: 'This server does not have a logo.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle(`${interaction.guild.name}'s Logo`)
            .setImage(serverIcon)
            .setColor('Blue')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};