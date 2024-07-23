const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const restartFile = path.join(__dirname, 'restart.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('restart')
        .setDescription('Restarts the bot. What else would it do? Make you a sandwich?.'),
    async execute(interaction) {
        const allowedRoleID = '1247882619602075749'; // Replace with the ID of the role allowed to use this command

        if (!interaction.member.roles.cache.has(allowedRoleID)) {
            return interaction.reply("let me think about that... NO.", { ephemeral: false });
        }

        try {
            const embed = new EmbedBuilder()
                .setTitle('Bot Restart')
                .setDescription('The bot is restarting...')
                .setColor('#FFA500')
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            // Save the restart request to a file
            fs.writeFileSync(restartFile, JSON.stringify({ channelId: interaction.channel.id }));

            // Add a small delay before exiting to ensure the message is sent
            setTimeout(() => {
                process.exit();
            }, 1000);
        } catch (error) {
            console.error('Error restarting the bot:', error);
            const errorembed = new EmbedBuilder()
                .setTitle('Error')
                .setDescription('An error occurred while trying to restart the bot.')
                .setColor('#FF0000');
            await interaction.reply({ embeds: [errorembed], ephemeral: false });
        }
    },
};

