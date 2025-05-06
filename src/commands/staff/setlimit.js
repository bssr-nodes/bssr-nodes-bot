const Discord = require("discord.js");

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
        return message.reply("Usage: `!setlimit <user_id> <new_limit>`");
    }

    const userId = args[1];
    const newLimit = parseInt(args[2]);

    if (isNaN(newLimit) || newLimit < 1) {
        return message.reply("Please provide a valid number greater than 0 for the new limit.");
    }

    const userLimitData = await userServerLimits.get(userId) || { count: 0, limit: 3 };
    await userServerLimits.set(userId, {
        count: userLimitData.count,
        limit: newLimit,
    });

    return message.reply(`Successfully set the server limit for user <@${userId}> to ${newLimit}.`);
};