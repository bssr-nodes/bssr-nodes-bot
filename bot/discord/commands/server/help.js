exports.run = async (client, message, args) => {
    let embed = new Discord.MessageEmbed().addField(
        "__**Commands**__",
        "Create a server: `" +
            config.DiscordBot.Prefix +
            "server create <type> <servername>` \nCreate a premium server: `" +
            config.DiscordBot.Prefix +
            "server create list` \nServer Redeem: `" +
            config.DiscordBot.Prefix +
            "server redeem <code>` \nLink Domain: `" +
            config.DiscordBot.Prefix +
            "server delete <serveridhere>` \n List servers: `" +
            config.DiscordBot.Prefix +
            "server list` \n See server count: `" +
            config.DiscordBot.Prefix +
            "server count` \n Get Informations about a server type: `"
    );
    await message.reply(embed);
};
