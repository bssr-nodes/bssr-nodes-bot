let subcommands = {
    admin: {
        role: ["Gives everyone a certain role.", ""],
    },
};

let desc = (object) => {
    let description = [];
    let entries = Object.entries(object);
    for (const [subCommand, [desc, usage]] of entries) {
        description.push(
            `**${subCommand}** - ${desc}\n (\`${config.DiscordBot.Prefix + "staff " + subCommand + " " + usage}\`)`
        );
    }
    return description;
};

exports.run = async (client, message, args) => {
    if (!message.member.roles.cache.find((r) => r.id === "1247882619602075749")) return;

    let embed = new Discord.MessageEmbed()
        .setColor("BLUE")
        .addField("**Administrator Commands:**", desc(subcommands.admin).join("\n"))
    await message.reply(embed);
};
