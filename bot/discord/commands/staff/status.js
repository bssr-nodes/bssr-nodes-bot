const axios = require("axios");
const os = require("os");
const osu = require("os-utils");
const { MessageEmbed } = require("discord.js");

exports.run = async (client, message, args) => {
    const allowedRoleID = "1247882619602075749";

    if (!message.member.roles.cache.has(allowedRoleID)) {
        return message.reply("You don't have permission to use this command.");
    }

    try {
        const botUptime = client.uptime;
        const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024 / 1024; // Convert to GB
        const totalMemory = os.totalmem() / 1024 / 1024 / 1024; // Convert to GB
        const freeMemory = os.freemem() / 1024 / 1024 / 1024; // Convert to GB
        let cpuUsage = 0;
        osu.cpuUsage((v) => cpuUsage = v); // Fetch CPU usage using os-utils
        const ping = client.ws.ping;
        const owner = 'ninsacc';
        const cpuCores = os.cpus().length;
        const cpuThreads = os.cpus().length * 2;

        // Fetch system metrics from API
        const response = await axios.get("http://13.72.252.246:3928/metrics");
        const { totalMemoryApi, freeMemoryApi, usedMemoryApi, cpuUsageApi } = response.data;

        // Convert API values from strings to numbers
        const totalMemoryApiNum = parseFloat(totalMemoryApi);
        const freeMemoryApiNum = parseFloat(freeMemoryApi);
        const usedMemoryApiNum = parseFloat(usedMemoryApi);
        const cpuUsageApiNum = parseFloat(cpuUsageApi);

        const stats = new MessageEmbed()
            .setTitle('📊 Bot Statistics')
            .setDescription('Here are the current bot statistics:')
            .addFields(
                { name: 'Bot Uptime', value: `\`\`\`${formatUptime(botUptime)}\`\`\``, inline: true },
                { name: 'Memory Usage (Bot)', value: `\`\`\`${memoryUsage.toFixed(2)} GB\`\`\``, inline: true },
                { name: 'Total Memory (Bot)', value: `\`\`\`${totalMemory.toFixed(2)} GB\`\`\``, inline: true },
                { name: 'Free Memory (Bot)', value: `\`\`\`${freeMemory.toFixed(2)} GB\`\`\``, inline: true },
                { name: 'Total Memory (API)', value: `\`\`\`${isNaN(totalMemoryApiNum) ? 'N/A' : totalMemoryApiNum.toFixed(2)} GB\`\`\``, inline: true },
                { name: 'Free Memory (API)', value: `\`\`\`${isNaN(freeMemoryApiNum) ? 'N/A' : freeMemoryApiNum.toFixed(2)} GB\`\`\``, inline: true },
                { name: 'Used Memory (API)', value: `\`\`\`${isNaN(usedMemoryApiNum) ? 'N/A' : usedMemoryApiNum.toFixed(2)} GB\`\`\``, inline: true },
                { name: 'CPU Usage (Bot)', value: `\`\`\`${(cpuUsage).toFixed(2)}%\`\`\``, inline: true },
                { name: 'CPU Usage (API)', value: `\`\`\`${isNaN(cpuUsageApiNum) ? 'N/A' : cpuUsageApiNum.toFixed(2)}%\`\`\``, inline: true },
                { name: 'Ping', value: `\`\`\`${ping} ms\`\`\``, inline: true },
                { name: 'Owner', value: `\`\`\`${owner}\`\`\``, inline: true },
                { name: 'CPU Cores', value: `\`\`\`${cpuCores}\`\`\``, inline: true },
                { name: 'CPU Threads', value: `\`\`\`${cpuThreads}\`\`\``, inline: true }
            )
            .setColor(0x00AE86)
            .setFooter('Bot Statistics, command by skycodee')
            .setTimestamp();

        await message.channel.send(stats);
    } catch (error) {
        console.error('Error fetching bot statistics:', error);
        const errorembed = new MessageEmbed()
            .setTitle('Error')
            .setDescription('An error occurred while fetching bot statistics.')
            .setColor('#FF0000');
        await message.channel.send(errorembed);
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
