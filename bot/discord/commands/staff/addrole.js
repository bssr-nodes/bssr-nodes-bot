const Discord = require("discord.js");

exports.run = async (client, message, args) => {
    const requiredRoleID = "1247882619602075749"; // Replace with the role ID that has permission to use this command

    if (!message.member.roles.cache.has(requiredRoleID)) {
        return message.reply("You don't have permission to use this command.");
    }

    const roleMention = message.mentions.roles.first();
    const roleID = roleMention ? roleMention.id : args[0];

    if (!roleID) {
        return message.reply("Invalid role ID provided or no role ID provided.");
    }

    const roleToAssign = message.guild.roles.cache.get(roleID);
    if (!roleToAssign) {
        return message.reply("Invalid role ID provided.");
    }

    const members = message.guild.members.cache.filter(member => !member.roles.cache.has(roleID));

    if (members.size === 0) {
        return message.reply("Everyone already has this role.");
    }

    const embed = new Discord.EmbedBuilder()
        .setTitle("Role Assignment")
        .setDescription(`Are you sure you want to assign the role **${roleToAssign.name}** to **${members.size}** members?`)
        .setColor("YELLOW")
        .setTimestamp();

    const msg = await message.channel.send(embed);
    await msg.react("✅").catch(console.error);
    await msg.react("❌").catch(console.error);

    const filter = (reaction, user) => ["✅", "❌"].includes(reaction.emoji.name) && user.id === message.author.id;
    const collector = msg.createReactionCollector(filter, { max: 1, time: 30000 });

    collector.on('collect', async (reaction) => {
        if (reaction.emoji.name === "✅") {
            message.reply(`Assigning the role **${roleToAssign.name}** to **${members.size}** members.`);

            for (const member of members.values()) {
                try {
                    await member.roles.add(roleToAssign);
                } catch (error) {
                    console.error(`Failed to assign role to ${member.user.tag}:`, error);
                }
            }

            message.channel.send(`Successfully assigned the role **${roleToAssign.name}** to **${members.size}** members.`);
        } else if (reaction.emoji.name === "❌") {
            message.reply("The role assignment has been cancelled.");
        }
    });

    collector.on('end', collected => {
        if (collected.size === 0) {
            message.reply("Did not receive a reaction in time. The role assignment has been cancelled.");
        }
    });
};
