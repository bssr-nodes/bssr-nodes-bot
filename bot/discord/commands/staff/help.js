let subcommands = {
    mods: {
        transfer: ["Something idk how this command works.", ""],
    },
    admin: {
        lockdown: ["Allows the channel to be locked or unlocked.", ""],
        addrole: ["Adds a role to all users.", "<role mention>"],
        addadmin: ["Gives a user admin on the panel.", "<user ping>"],
        say: ["Makes the bot say something.", "<content>"],
        updatepfp: ["Update the bot's pfp to the server icon.", ""],
        status: ["Shows status on the server.", ""],
        
    },
    botdev: {
        linked: ["Shows if the users account is linked.", "<userid>"],
        maintenance: ["Set a Node into maintenance for Node Status.", "<nodeName>"],
        update: ["Pulls files from GitHub manaully.", ""],
    },
    misc: {
        premium: ["Set, add, or remove premium servers from a user.", "<set||add||remove> <user> <amount>"],
        code: ["Create a code that is worth premium servers.", "<codename> <amount>"],
        drop: ["Drops a code within the channel within a certain time.", "<time> <code>"],
        help: ["Pulls up this help menu.", ""],
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
    if (!message.member.roles.cache.find((r) => r.id === "1250045509868195840")) return;

    let embed = new Discord.EmbedBuilder()
        .setColor("BLUE")
        .addField("**Moderator Commands:**", desc(subcommands.mods).join("\n"))
        .addField("**Administrator Commands:**", desc(subcommands.admin).join("\n"))
        .addField("**Bot Developer Commands:**", desc(subcommands.botdev).join("\n"))
        .addField("**Misc Commands:**", desc(subcommands.misc).join("\n"));
    await message.reply(embed);
};
