const { EmbedBuilder } = require('discord.js');
const humanizeDuration = require('humanize-duration');

module.exports = {
    data: {
        name: 'uptime',
        description: 'Displays bot uptime obviously',
    },
    async execute(interaction) {
        try {
            // Get the bot uptime and convert it to a human-readable format
            const uptime = humanizeDuration(interaction.client.uptime, { round: true });

            // Get the bot's ready timestamp
            let myDate = new Date(interaction.client.readyTimestamp);

            // Create an embed message
            const embed = new EmbedBuilder()
                .addField(':white_check_mark: Uptime:', `**${uptime}**`, true)
                .addField('Memory usage:', `${Math.trunc(process.memoryUsage().heapUsed / 1024 / 1000)}mb`, true)
                .addField('API latency:', `${interaction.client.ws.ping}ms`, true)
                .setFooter(`Ready Timestamp: ${myDate.toString()}`)
                .setColor('GREEN');

            // Send the embed as a response
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error executing uptime command:', error);
            await interaction.reply({ content: 'There was an error executing the command!', ephemeral: true });
        }
    },
};
