const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const humanizeDuration = require('humanize-duration');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('uptime')
        .setDescription('Displays bot uptime'),
    async execute(interaction) {
        try {
            const uptime = humanizeDuration(interaction.client.uptime, { round: true });

            let myDate = new Date(interaction.client.readyTimestamp);

            const embed = new EmbedBuilder()
                .setTitle(':white_check_mark: Bot Uptime')
                .addFields(
                    { name: 'Uptime:', value: `**${uptime}**`, inline: true },
                    { name: 'Memory usage:', value: `${Math.trunc(process.memoryUsage().heapUsed / 1024 / 1000)}mb`, inline: true },
                    { name: 'API latency:', value: `${interaction.client.ws.ping}ms`, inline: true }
                )
                .setFooter({ text: `Ready Since: ${myDate.toUTCString()}` })
                .setColor('Green');

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error executing uptime command:', error);
            await interaction.reply({ content: 'There was an error executing the command!', ephemeral: true });
        }
    },
};