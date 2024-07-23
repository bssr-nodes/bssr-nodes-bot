const Discord = require('discord.js');

exports.run = async (client, message, args) => {
    // Check if user has the dev role
    if (!message.member.roles.cache.has('1247882619602075749')) return;

    // Define the role ID to use instead of @everyone
    const everyoneRoleId = '1250747708826976337';

    // Helper function to create embeds for each step
    const createEmbed = (title, description) => {
        return new Discord.EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor('BLUE');
    };

    // Prompt for changelog topic
    const topicEmbed = createEmbed('Changelog Topic', 'What is the topic of the changelog?');
    await message.channel.send(topicEmbed);

    const topicFilter = response => response.author.id === message.author.id;
    const topicCollector = message.channel.createMessageCollector(topicFilter, { max: 1, time: 60000 });

    topicCollector.on('collect', async topicMessage => {
        const topic = topicMessage.content;

        // Function to ask for roles to ping
        const askForRoles = async () => {
            const rolesEmbed = createEmbed('Select Roles to Ping', 'Enter the role IDs you want to ping, separated by spaces. You can include "everyone" by typing "everyone". Keep in mind this will mention the members role due to limits set by discord on bots.');
            await message.channel.send(rolesEmbed);

            const roleFilter = response => response.author.id === message.author.id;
            const roleCollector = message.channel.createMessageCollector(roleFilter, { max: 1, time: 60000 });

            roleCollector.on('collect', async roleMessage => {
                const roleIds = roleMessage.content.split(' ');
                let roles = '';

                for (const roleId of roleIds) {
                    if (roleId.toLowerCase() === 'everyone') {
                        roles += `<@&${everyoneRoleId}> `;
                    } else {
                        const role = message.guild.roles.cache.get(roleId);
                        if (role) {
                            roles += `<@&${role.id}> `;
                        } else {
                            const invalidRoleEmbed = createEmbed('Invalid Role ID', `Invalid role ID: ${roleId}. Please provide valid role IDs.`);
                            await message.channel.send(invalidRoleEmbed);
                            return askForRoles(); // Ask for roles again if any invalid role is found
                        }
                    }
                }

                // Prompt for changelog content
                const contentEmbed = createEmbed('Changelog Content', 'What is the changelog content?');
                await message.channel.send(contentEmbed);

                const contentFilter = response => response.author.id === message.author.id;
                const contentCollector = message.channel.createMessageCollector(contentFilter, { max: 1, time: 60000 });

                contentCollector.on('collect', async contentMessage => {
                    const content = contentMessage.content;

                    // Create and send the changelog embed
                    const changelogEmbed = new Discord.EmbedBuilder()
                        .setColor('GREEN')
                        .setTitle('Changelog')
                        .setDescription(`### ${topic}\n\n**Content:**\n${content}\n\nFrom ${message.author}`)
                        .setTimestamp();

                    const channel = client.channels.cache.get('1250741147303936060');
                    await channel.send(roles, changelogEmbed);
                    const successEmbed = createEmbed('Changelog Sent', 'The changelog has been successfully sent!');
                    await message.channel.send(successEmbed);
                });

                contentCollector.on('end', collected => {
                    if (collected.size === 0) {
                        const timeoutEmbed = createEmbed('Timeout', 'Changelog content input timed out. Please try again.');
                        message.channel.send(timeoutEmbed);
                    }
                });
            });

            roleCollector.on('end', collected => {
                if (collected.size === 0) {
                    const timeoutEmbed = createEmbed('Timeout', 'Role selection input timed out. Please try again.');
                    message.channel.send(timeoutEmbed);
                }
            });
        };

        // Start the role selection process
        askForRoles();
    });

    topicCollector.on('end', collected => {
        if (collected.size === 0) {
            const timeoutEmbed = createEmbed('Timeout', 'Changelog topic input timed out. Please try again.');
            message.channel.send(timeoutEmbed);
        }
    });
};