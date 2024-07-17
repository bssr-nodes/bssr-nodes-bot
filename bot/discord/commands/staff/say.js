exports.run = async (client, message, args) => {
    const allowedRoleID = "1247882619602075749";

    if (!message.member.roles.cache.has(allowedRoleID)) {
        return message.reply("nuh uh youre not an admin");
    }

    const sayMessage = args.slice(1).join(" ");
    if (!sayMessage) {
        return message.reply("Please provide a message for the bot to say.");
    }

    try {
        await message.delete();
        await message.channel.send(sayMessage);
    } catch (error) {
        console.error("Failed to send message through the bot:", error);
        message.reply("There was an error sending the message through the bot.");
    }
};
