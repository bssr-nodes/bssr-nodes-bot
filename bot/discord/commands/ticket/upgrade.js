const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    async execute(interaction) {
        if (!interaction.channel.name.includes('-ticket')) {
            return interaction.reply({
                content: 'This command can only be used in ticket channels.',
                ephemeral: true
            });
        }

        try {
            await interaction.channel.permissionOverwrites.edit("1250045509868195840", {
                [PermissionFlagsBits.ViewChannel]: false,
                [PermissionFlagsBits.SendMessages]: false,
                [PermissionFlagsBits.ReadMessageHistory]: false,
            });

            await interaction.channel.permissionOverwrites.edit(interaction.user.id, {
                [PermissionFlagsBits.ViewChannel]: true,
                [PermissionFlagsBits.SendMessages]: true,
                [PermissionFlagsBits.ReadMessageHistory]: true,
            });

            const embed = new EmbedBuilder()
                .setColor('BLUE')
                .setTitle('Ticket Upgraded')
                .setDescription('Removed staff access. Now only you and specified roles can see your ticket.')
                .setTimestamp()
                .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error updating channel permissions:', error);
            await interaction.reply({
                content: 'There was an error updating the ticket permissions.',
                ephemeral: true
            });
        }
    },
};
