const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('history')
        .setDescription('Show the moderation history of a user')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The member whose history you want to view')
                .setRequired(true)),
    
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const userHistory = global.moderationHistory.get(target.id) || [];

        if (userHistory.length === 0) {
            return interaction.reply({ content: 'This user has no moderation history.', ephemeral: true });
        }

        const historyEmbed = new EmbedBuilder()
            .setColor('BLUE')
            .setTitle(`Moderation History for ${target.tag}`)
            .setTimestamp();

        userHistory.forEach(entry => {
            historyEmbed.addFields(
                { name: 'Action', value: entry.action, inline: true },
                { name: 'Reason', value: entry.reason, inline: true },
                { name: 'Date', value: `<t:${Math.floor(new Date(entry.date).getTime() / 1000)}:f>`, inline: true },
                { name: 'Duration', value: entry.duration || 'N/A', inline: true },
                { name: 'Moderator', value: `<@${entry.moderator}>`, inline: true },
            );
        });

        await interaction.reply({ embeds: [historyEmbed] });
    },
};
