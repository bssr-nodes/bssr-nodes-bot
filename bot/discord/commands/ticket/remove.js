const { EmbedBuilder, Colors, PermissionsBitField } = require('discord.js');

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
                [PermissionsBitField.Flags.ViewChannel]: false,
                [PermissionsBitField.Flags.SendMessages]: false,
                [PermissionsBitField.Flags.ReadMessageHistory]: false,
            });

            const embed = new EmbedBuilder()
                .setColor(Colors.Red)
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
};