const Discord = require("discord.js");
const Config = require('../../../config.json');

exports.description = "Update all existing users to include a server limit.";

/**
 * 
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 * @param {Array} args
 * @returns void
 */
exports.run = async (client, message, args) => {
    if (!message.member.roles.cache.some(role => Config.DiscordBot.Roles.BotAdmin.includes(role.id))) {
    }

    try {
        const allUsers = await userData.all();

        for (const user of allUsers) {
            const userId = user.id;
            const userDataEntry = user.value;
            
            if (!userDataEntry.serverLimit) {
                userDataEntry.serverLimit = 5;
                await userData.update(userId, userDataEntry);
            }
        }

        return message.reply("Successfully updated all users to include a server limit.");
    } catch (error) {
        console.error("Error updating users:", error);
        return message.reply("An error occurred while updating the database.");
    }
};