const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    async execute(interaction) {
        // Check if the user has the dev role
        if (!interaction.member.roles.cache.has('1247882619602075749')) {
            return interaction.reply({ content: 'You do not have the required permissions to use this command.', ephemeral: true });
        }

        const topic = interaction.options.getString('topic');
        const roleIds = interaction.options.getString('roles').split(' ');
        const content = interaction.options.getString('content');

        // Define the role ID to use instead of @everyone
        const everyoneRoleId = '1250747708826976337';

        // Function to create embeds
        const createEmbed = (title, description) => {
            return new EmbedBuilder()
                .setTitle(title)
                .setDescription(description)
                .setColor('BLUE');
        };

        let roles = '';
        for (const roleId of roleIds) {
            if (roleId.toLowerCase() === 'everyone') {
                roles += `<@&${everyoneRoleId}> `;
            } else {
                const role = interaction.guild.roles.cache.get(roleId);
                if (role) {
                    roles += `<@&${role.id}> `;
                } else {
                    return interaction.reply({ content: `Invalid role ID: ${roleId}. Please provide valid role IDs.`, ephemeral: true });
                }
            }
        }

        // Create and send the changelog embed
        const changelogEmbed = new EmbedBuilder()
            .setColor('GREEN')
            .setTitle('Changelog')
            .setDescription(`### ${topic}\n\n**Content:**\n${content}\n\nFrom ${interaction.user}`)
            .setTimestamp();

        const channel = interaction.client.channels.cache.get('1250741147303936060');
        if (!channel) {
            return interaction.reply({ content: 'Changelog channel not found.', ephemeral: true });
        }

        await channel.send({ content: roles, embeds: [changelogEmbed] });

        const successEmbed = createEmbed('Changelog Sent', 'The changelog has been successfully sent!');
        await interaction.reply({ embeds: [successEmbed], ephemeral: true });
    },
};
