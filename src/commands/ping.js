const Discord = require("discord.js");


exports.description = "Shows the bot's latency.";

/**
 * 
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {Array} args 
 * @returns void
 */
exports.run = async (client, message, args) => {
    const Embed = new Discord.EmbedBuilder()
        .setColor("Red")
        .setTitle("BSSR Nodes - Ping")
        .setDescription(
            `Bot Latency: ${Date.now() - message.createdTimestamp}ms\nAPI Latency: ${Math.round(client.ws.ping)}ms`,
        )
        .setTimestamp();

    message.reply({embeds: [Embed]});
};