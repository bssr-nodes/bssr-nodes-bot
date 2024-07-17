exports.run = async (client, message, args) => {
    const embed = new Discord.MessageEmbed().addField(
        "__**Commands**__",
        "`" +
            config.DiscordBot.Prefix +
            "ticket add` | Add a user to a ticket \n`" +
            config.DiscordBot.Prefix +
            "ticket close` | Close a ticket \n`" +
            config.DiscordBot.Prefix +
            "ticket downgrade` | Lets all staff see your ticket \n`" +
            config.DiscordBot.Prefix +
            "ticket new` | Opens a new ticket \n`" +
            config.DiscordBot.Prefix +
            "ticket remove` | Removes a user from your ticket \n`" +
            config.DiscordBot.Prefix +
            "ticket upgrade` | Lets only admins see your ticket"
    );
    await message.reply(embed);
};
