const Discord = require("discord.js");
const Config = require('../../../config.json');

exports.description = "Adjust the server limit for a user.";

/**
 * 
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 * @param {Array} args
 * @returns void
 */
exports.run = async (client, message, args) => {
    if (!message.member.roles.cache.some(role => Config.DiscordBot.Roles.Admin.includes(role.id))) return;

    if (args.length < 3) {
        return message.reply("Usage: `!staff setlimit <user_id> <new_limit>`");
    }

    const userId = args[1];
    const newLimit = parseInt(args[2]);

    if (isNaN(newLimit) || newLimit < 1) {
        return message.reply("Please provide a valid number greater than 0 for the new limit.");
    }

    const userDataEntry = await userData.get(userId) || { serverLimit: 3 };

    userDataEntry.serverLimit = newLimit;
    await userData.set(userId, userDataEntry);

    return message.reply(`Successfully set the server limit for user <@${userId}> to ${newLimit}.`);
};