const { MessageEmbed } = require("discord.js");

exports.run = async (client, message, args) => {
    const allowedRoleID = "1247882619602075749"; // Replace with the ID of the role allowed to use this command

    if (!message.member.roles.cache.has(allowedRoleID)) {
        return message.reply("get fucked dipshit u aint a dev for this bot");
    }

    try {
        const embed = new MessageEmbed()
            .setTitle('Bot Restart')
            .setDescription('The bot is restarting...')
            .setColor('#FFA500')
            .setTimestamp();

        await message.channel.send(embed);

        // Add a small delay before exiting to ensure the message is sent
        setTimeout(() => {
            process.exit();
        }, 1000);
    } catch (error) {
        console.error('Error restarting the bot:', error);
        const errorembed = new MessageEmbed()
            .setTitle('Error')
            .setDescription('An error occurred while trying to restart the bot.')
            .setColor('#FF0000');
        await message.channel.send(errorembed);
    }
};
