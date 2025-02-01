const Discord = require("discord.js");

/**
 * 
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {Array} args 
 * @returns void
 */
exports.run = async (client, message, args) => {
    const LinksEmbed = new Discord.EmbedBuilder()
        .setColor("Blue")

        .addFields(
            {name: "Website", value: "[bssr-nodes.com](https://bssr-nodes.com)", inline: true},
            {name: "Panel", value: "[panel.bssr-nodes.com](https://panel.bssr-nodes.com)", inline: true},
        )

    return message.reply({embeds: [LinksEmbed]});
};

exports.description = "Show links to BSSR Nodes services.";
