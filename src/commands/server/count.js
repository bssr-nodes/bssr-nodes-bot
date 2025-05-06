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

    if (userAccount == null) return message.channel.send('User does not have account linked.');

    await getUserServers(userAccount.consoleID).then(async (Response) => {
            const userServers = Response.attributes.relationships.servers.data; //The user server data from the panel.

            const serverCountEmbed = new Discord.EmbedBuilder()
                .setTitle(`Server Count:`)
                .setDescription(`
                    Server count: ${userServers.length} out of ${userAccount.serverLimit} servers used.\nRemaining slots: ${userServers.length - userAccount.serverLimit}
                    `)
                .setColor("Blurple")
                .setFooter({text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL()})
                .setTimestamp();

            await message.reply({embeds: [serverCountEmbed]});
    }).catch(async (Error) => {
        await message.reply("An error occurred while loading servers.");
    });
};