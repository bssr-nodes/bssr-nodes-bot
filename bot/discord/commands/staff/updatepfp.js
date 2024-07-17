const Discord = require("discord.js");

exports.run = async (client, message, args) => {
    if (!message.member.hasPermission("ADMINISTRATOR")) {
        return message.reply("youre not an admin you arent touching this command :3 - tara");
    }

    const serverIconURL = message.guild.iconURL({ format: "png", dynamic: true, size: 1024 });

    if (!serverIconURL) {
        return message.reply("This server does not have an icon set.");
    }

    try {
        await client.user.setAvatar(serverIconURL);
        message.reply("Successfully updated the bot's profile picture to match the server's icon.");
    } catch (error) {
        console.error("Failed to update the bot's profile picture:", error);
        message.reply("There was an error updating the bot's profile picture.");
    }
};