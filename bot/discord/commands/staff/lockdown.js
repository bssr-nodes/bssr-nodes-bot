const Discord = require('discord.js');
const logchannel = '1250044011457024040'; // Replace with your actual log channel ID

exports.run = async (client, message, args) => {
    if (!message.member.roles.cache.find((r) => ["1247882619602075749"].some((x) => x == r.id)))
        return;

    // Capture the reason from the command arguments
    const reason = args.slice(2).join(' ');
    
    const channel = message.channel;
    const author = message.author.tag;

    if (!args[1]) {
        message.reply("Please specify `lock` or `unlock`.");
        return;
    }

    if (args[1].toLowerCase() === "lock") {
        const locked = new Discord.EmbedBuilder()
            .setColor("RED")
            .setTitle("Channel Locked")
            .setDescription(`Channel is now locked. Only admins+ can post here.\n**Reason:** ${reason || 'No reason provided'}`)
            .setTimestamp();

        // Send the embed to the current channel
        await message.channel.send(locked);

        const logEmbed = new Discord.EmbedBuilder()
            .setColor("RED")
            .setDescription(`🔒 ${channel} was locked by ${author}.\n**Reason:** ${reason || 'No reason provided'}`)
            .setTimestamp();

        // Send the log embed to the log channel
        const logChannel = client.channels.cache.get(logchannel);
        if (logChannel) {
            logChannel.send(logEmbed);
        } else {
            console.error(`Log channel with ID ${logchannel} not found.`);
        }

        // Update channel permissions to lock it
        await message.channel.updateOverwrite(message.guild.roles.everyone, {
            SEND_MESSAGES: false,
        });
    } else if (args[1].toLowerCase() === "unlock") {
        // Unlock the channel
        const unlocked = new Discord.EmbedBuilder()
            .setColor("RED")
            .setTitle("Channel Unlocked")
            .setDescription(`Channel is now unlocked. Everyone can post here.\n**Reason:** ${reason || 'No reason provided'}`)
            .setTimestamp();

        // Send the embed to the current channel
        await message.channel.send(unlocked);

        const log = new Discord.EmbedBuilder()
            .setColor("GREEN")
            .setDescription(`🔓 ${channel} was unlocked by ${author}.\n**Reason:** ${reason || 'No reason provided'}`)
            .setTimestamp();

        // Send the log embed to the log channel
        const logChannel = client.channels.cache.get(logchannel);
        if (logChannel) {
            logChannel.send(log);
        } else {
            console.error(`Log channel with ID ${logchannel} not found.`);
        }

        await message.channel.updateOverwrite(message.guild.roles.everyone, {
            SEND_MESSAGES: null,
        });
    } else {
        message.reply("Invalid command. Use `lock` or `unlock`.");
    }
};