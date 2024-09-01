const { PermissionFlagsBits, EmbedBuilder, Colors } = require('discord.js');

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
                [PermissionFlagsBits.ViewChannel]: true,
                [PermissionFlagsBits.SendMessages]: true,
                [PermissionFlagsBits.ReadMessageHistory]: true,
            });

            const embed = new EmbedBuilder()
                .setColor(Colors.Green)
                .setTitle('Ticket Visibility Updated')
                .setDescription('Now all staff can see your ticket.')
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