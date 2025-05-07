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

        if (!allUsers || allUsers.length === 0) {
            return message.reply("No users found in the database.");
        }

        let updatedCount = 0;

        for (const user of allUsers) {
            const userId = user.id;
            const userDataEntry = user.value;

            console.log(`Processing user ${userId}:`, userDataEntry);

            if (userDataEntry.serverLimit === 3) {
                userDataEntry.serverLimit = 5;
                await userData.update(userId, userDataEntry);
                updatedCount++;
                console.log(`Updated user ${userId} to serverLimit 5.`);
            }
        }

        return message.reply(`Successfully updated ${updatedCount} users to include a server limit of 5.`);
    } catch (error) {
        console.error("Error updating users:", error);
        return message.reply("An error occurred while updating the database.");
    }
};