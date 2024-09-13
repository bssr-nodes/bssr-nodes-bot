const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');

const { hosturl, apikey } = config.Pterodactyl;
const requiredRoleID = '1256635935001546826'; 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('grantadmin')
        .setDescription('Grants admin access to a user\'s Pterodactyl console account.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user you want to grant admin access to')
                .setRequired(true)
        ),

    async execute(interaction) {
        const member = interaction.member;

        if (!member.roles.cache.has(requiredRoleID)) {
            return interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
        }

        const targetUser = interaction.options.getUser('user');
        const userID = targetUser.id;

        const userAccount = userData.get(userID);
        if (!userAccount) {
            return interaction.reply({ content: "That account is not linked with a console account.", ephemeral: true });
        }

        const consoleID = userAccount.consoleID;
        if (!consoleID) {
            return interaction.reply({ content: "Unable to find the console ID for the provided user.", ephemeral: true });
        }

        try {
            const userResponse = await axios.get(`${hosturl}/api/application/users/${consoleID}`, {
                headers: {
                    'Authorization': `Bearer ${apikey}`,
                    'Accept': 'Application/vnd.pterodactyl.v1+json'
                }
            });

            const userData = userResponse.data.attributes;

            const updateResponse = await axios.patch(
                `${hosturl}/api/application/users/${consoleID}`,
                {
                    username: userData.username,
                    email: userData.email,
                    first_name: userData.first_name,
                    last_name: userData.last_name,
                    root_admin: true
                },
                {
                    headers: {
                        'Authorization': `Bearer ${apikey}`,
                        'Content-Type': 'application/json',
                        'Accept': 'Application/vnd.pterodactyl.v1+json'
                    }
                }
            );

            if (updateResponse.status === 200) {
                const successEmbed = new EmbedBuilder()
                    .setColor('Green')
                    .setTitle('Admin Access Granted')
                    .setDescription(`Successfully granted admin access to the user with Discord ID: ${userID}.`)
                    .setTimestamp();

                await interaction.reply({ embeds: [successEmbed] });
            } else {
                await interaction.reply({ content: "Failed to grant admin access. Please check the Pterodactyl panel settings.", ephemeral: true });
            }

        } catch (error) {
            console.error("Error granting admin access:", error);

            if (error.response) {
                console.error("Response data:", error.response.data);
                await interaction.reply({ content: `An error occurred: ${error.response.data.errors[0].detail}`, ephemeral: true });
            } else if (error.request) {
                await interaction.reply({ content: "No response received from the Pterodactyl panel. Please try again later.", ephemeral: true });
            } else {
                await interaction.reply({ content: "An unexpected error occurred. Please try again later.", ephemeral: true });
            }
        }
    }
};
