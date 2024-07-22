const { EmbedBuilder } = require('discord.js');
const axios = require("axios");
const os = require("os");
const osu = require("os-utils");

// Define the slash command
module.exports = {
    data: {
        name: 'status',
        description: 'Gets the status on stuff',
    },
    async execute(interaction) {
        // Timeout for the API request (2 seconds)
        const timeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timed out')), 2000)
        );

        // API request promise
        const apiRequest = axios.get("http:///metrics");

        // Race between the API request and timeout
        let apiData;
        try {
            apiData = await Promise.race([apiRequest, timeout]);
        } catch (error) {
            console.error('Error fetching API data:', error);
            apiData = { data: { totalMemoryApi: 'N/A', freeMemoryApi: 'N/A', usedMemoryApi: 'N/A', cpuUsageApi: 'N/A' } };
        }

        const botUptime = interaction.client.uptime;
        const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024 / 1024; // Convert to GB
        const totalMemory = os.totalmem() / 1024 / 1024 / 1024; // Convert to GB
        const freeMemory = os.freemem() / 1024 / 1024 / 1024; // Convert to GB
        let cpuUsage = 0;
        osu.cpuUsage((v) => cpuUsage = v); // Fetch CPU usage using os-utils
        const ping = interaction.client.ws.ping;
        const owner = 'ninsacc';
        const pixel = 'SOON';

        // Convert API values from strings to numbers
        const { totalMemoryApi, freeMemoryApi, usedMemoryApi, cpuUsageApi } = apiData.data;
        const totalMemoryApiNum = parseFloat(totalMemoryApi);
        const freeMemoryApiNum = parseFloat(freeMemoryApi);
        const usedMemoryApiNum = parseFloat(usedMemoryApi);
        const cpuUsageApiNum = parseFloat(cpuUsageApi);

        const stats = new EmbedBuilder()
            .setTitle('📊 Bot Statistics')
            .setDescription('Here are the current bot statistics:')
            .addFields(
                { name: 'Bot Uptime', value: `\`\`\`${formatUptime(botUptime)}\`\`\``, inline: true },
                { name: 'CPU Usage (Bot)', value: `\`\`\`${(cpuUsage).toFixed(2)}%\`\`\``, inline: true },
                { name: 'Memory Usage (Bot)', value: `\`\`\`${memoryUsage.toFixed(2)} GB\`\`\``, inline: true },
                { name: 'Ping', value: `\`\`\`${ping} ms\`\`\``, inline: true },
                { name: 'Owner', value: `\`\`\`${owner}\`\`\``, inline: true },
                { name: 'Total Memory (Byte)', value: `\`\`\`${isNaN(totalMemoryApiNum) ? 'N/A' : totalMemoryApiNum.toFixed(2)} GB\`\`\``, inline: true },
                { name: 'Free Memory (Byte)', value: `\`\`\`${isNaN(freeMemoryApiNum) ? 'N/A' : freeMemoryApiNum.toFixed(2)} GB\`\`\``, inline: true },
                { name: 'Used Memory (Byte)', value: `\`\`\`${isNaN(usedMemoryApiNum) ? 'N/A' : usedMemoryApiNum.toFixed(2)} GB\`\`\``, inline: true },
                { name: 'CPU Usage (Byte)', value: `\`\`\`${isNaN(cpuUsageApiNum) ? 'N/A' : cpuUsageApiNum.toFixed(2)}%\`\`\``, inline: true },
                { name: 'Total Memory (Pixel)', value: `\`\`\`${pixel}\`\`\``, inline: true },
                { name: 'Free Memory (Pixel)', value: `\`\`\`${pixel}\`\`\``, inline: true },
                { name: 'Used Memory (Pixel)', value: `\`\`\`${pixel}\`\`\``, inline: true },
                { name: 'CPU Usage (Pixel)', value: `\`\`\`${pixel}\`\`\``, inline: true },
            )
            .setColor(0x00AE86)
            .setFooter('Bot Statistics, command by skycodee')
            .setTimestamp();

        await interaction.reply({ embeds: [stats] });
    }
};

function formatUptime(botUptime) {
    const uptime = {
        months: Math.floor(botUptime / (1000 * 60 * 60 * 24 * 30)),
        weeks: Math.floor((botUptime % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24 * 7)),
        days: Math.floor((botUptime % (1000 * 60 * 60 * 24 * 7)) / (1000 * 60 * 60 * 24)),
        hours: Math.floor((botUptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((botUptime % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((botUptime % (1000 * 60)) / 1000),
    };

    return Object.entries(uptime)
        .filter(([_, value]) => value > 0)
        .map(([key, value]) => `${value} ${key}`)
        .join(', ');
}
