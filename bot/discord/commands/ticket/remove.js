<<<<<<< HEAD
const { EmbedBuilder } = require('discord.js');

module.exports = {
    async execute(interaction) {
        if (!interaction.channel.name.includes("-ticket")) {
            return interaction.reply({
                content: 'You can only use this command in a ticket channel.',
                ephemeral: true
            });
        }

        const user = interaction.options.getUser('user');
        if (!user) {
            return interaction.reply({
                content: 'Please mention or specify the user to remove from this ticket.',
                ephemeral: true
            });
        }

        const member = interaction.guild.members.cache.get(user.id);
        if (!member) {
            return interaction.reply({
                content: 'Could not find that user in this server.',
                ephemeral: true
            });
        }

        const staffRoleIDs = ["1247882619602075749", "1250045509868195840"];
        const isStaff = member.roles.cache.some(role => staffRoleIDs.includes(role.id));
        if (isStaff) {
            return interaction.reply({
                content: 'You cannot remove staff members from the ticket.',
                ephemeral: true
            });
        }

        try {
            await interaction.channel.permissionOverwrites.edit(user.id, {
                VIEW_CHANNEL: false,
                SEND_MESSAGES: false,
                READ_MESSAGE_HISTORY: false,
            });

            const embed = new EmbedBuilder()
                .setColor('RED')
                .setTitle('User Removed from Ticket')
                .setDescription(`Successfully removed ${user.tag} from this ticket.`)
                .setTimestamp()
                .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error updating channel permissions:', error);
            await interaction.reply({
                content: 'There was an error removing the user from the ticket.',
                ephemeral: true
            });
        }
    },
=======
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
>>>>>>> 469902f (push the changes i made on ptero)
};
