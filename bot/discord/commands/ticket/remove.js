exports.run = async (client, message, args) => {
    if (!message.channel.name.includes("-ticket"))
        return message.reply(`You can only use this command in a ticket channel.`);

    let user = message.mentions.users.first() || message.guild.members.cache.get(args[1]);
    if (!user) return message.reply(`Please mention or specify the user's ID you want to add to this ticket.`);

    // Fetch the member object from the user
    let member = message.guild.members.cache.get(user.id);
    if (!member) return message.reply(`Could not find that user in this server.`);

    const staffRoleIDs = ["1247882619602075749", "1250045509868195840"];

    const isStaff = member.roles.cache.some(role => staffRoleIDs.includes(role.id));
    if (isStaff) {
        return message.reply(`You cannot remove staff members from the ticket.`);
    }

    await message.channel.updateOverwrite(user, {
        VIEW_CHANNEL: false,
        SEND_MESSAGES: false,
        READ_MESSAGE_HISTORY: false,
    });

    message.reply(`Successfully removed ${user} from this ticket.`);
};
