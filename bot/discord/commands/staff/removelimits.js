const axios = require('axios');
const { EmbedBuilder } = require('discord.js');

exports.run = async (client, message, args) => {
    // Role ID that is allowed to use this command
    const allowedRoleID = '1247882619602075749';

    // Check if the user has the allowed role
    if (!message.member.roles.cache.has(allowedRoleID)) {
        return message.reply("You don't have permission to use this command.");
    }

    // Extract server ID from command arguments
    const serverID = args[0];

    if (!serverID) {
        return message.reply('Please provide a server ID.');
    }

    try {
        // Send PATCH request to remove limits for the specified server
        const response = await axios.patch(
            `${config.Pterodactyl.hosturl}/api/application/servers/${serverID}/build`,
            {
                limits: {
                    memory: 0, // Set memory limit to infinite (0)
                    swap: 0,   // Set swap limit to infinite (0)
                    disk: 0,   // Set disk limit to infinite (0)
                    io: 500,   // Optionally set I/O limit (500 MiB/s)
                },
            },
            {
                headers: {
                    Authorization: `Bearer ${config.Pterodactyl.apikey}`,
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
            }
        );

        // Handle success response
        const embed = new EmbedBuilder()
            .setTitle('Server Limits Removed')
            .setDescription(`Limits removed for server ID ${serverID}.`)
            .setColor(0x00AE86)
            .setTimestamp();

        await message.channel.send(embed);
    } catch (error) {
        console.error('Error removing server limits:', error);

        // Handle error response
        const errorEmbed = new EmbedBuilder()
            .setTitle('Error')
            .setDescription('An error occurred while removing server limits.')
            .setColor('#FF0000');

        await message.channel.send(errorEmbed);
    }
};
