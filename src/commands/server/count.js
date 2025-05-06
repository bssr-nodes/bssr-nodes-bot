const Discord = require('discord.js');

const Config = require('../../../config.json');
const getUserServers = require('../../util/getUserServers.js');

exports.description = "Shows the amount of servers a user has.";

/**
 * 
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {Array} args 
 * @returns void
 */
exports.run = async (client, message, args) => {

    const UserId =
        args[1] && args[1].match(/[0-9]{17,19}/)
            ? args[1].match(/[0-9]{17,19}/)[0]
            : message.author.id;

    const userAccount = await userData.get(UserId);

    if (!userAccount) {
        return message.channel.send('User does not have an account linked.');
    }

    try {
        const response = await getUserServers(userAccount.consoleID);
        const userServers = response.attributes.relationships.servers.data; // The user server data from the panel.
        const serversUsed = userServers.length;
        const serverLimit = parseInt(userAccount.serverLimit, 10) || 3;

        let remainingSlotsText;
        if (isNaN(serverLimit) || serverLimit > Number.MAX_SAFE_INTEGER) {
            remainingSlotsText = "lower yo fuckin server count this shit too high for me to process :sob:";
        } else {
            const remainingSlots = Math.max(serverLimit - serversUsed, 0);
            remainingSlotsText = `Remaining slots: ${remainingSlots.toLocaleString()}`;
        }

        const serverCountEmbed = new Discord.EmbedBuilder()
            .setTitle(`Server Count:`)
            .setDescription(`
                Servers used: ${serversUsed} out of ${serverLimit.toLocaleString()}.\n${remainingSlotsText}
            `)
            .setColor("Blurple")
            .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        await message.reply({ embeds: [serverCountEmbed] });
    } catch (error) {
        console.error(error);
        await message.reply("An error occurred while loading servers.");
    }
};