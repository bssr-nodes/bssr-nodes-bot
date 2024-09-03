const { PermissionFlagsBits, EmbedBuilder, ChannelType, Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    async execute(interaction) {
        const categoryId = '1250790663662993579';
        const staffRoleId = '1250045509868195840';
        const archiveDir = path.join(__dirname, '../../ticket-archives');

        let category;
        try {
            category = await interaction.guild.channels.fetch(categoryId);
            if (!category || category.type !== ChannelType.GuildCategory) {
                throw new Error('Ticket category not found or invalid.');
            }
        } catch (error) {
            console.error('Error fetching category:', error);
            return interaction.reply({ content: `Error fetching category: ${error.message}`, ephemeral: true });
        }

        const existingTicket = interaction.guild.channels.cache.find(ch => 
            ch.name === `${interaction.user.username.toLowerCase().replace(' ', '-')}-ticket-${Date.now()}`
        );

        if (existingTicket) {
            return interaction.reply({ content: 'You already have an open ticket.', ephemeral: true });
        }

        let channel;
        try {
            channel = await interaction.guild.channels.create({
                name: `${interaction.user.username.toLowerCase().replace(' ', '-')}-ticket-${Date.now()}`,
                type: ChannelType.GuildText,
                parent: category.id,
                permissionOverwrites: [
                    {
                        id: interaction.guild.roles.everyone.id,
                        deny: [PermissionFlagsBits.ViewChannel],
                    },
                    {
                        id: interaction.user.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
                    },
                    {
                        id: staffRoleId,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory],
                        deny: [PermissionFlagsBits.SendMessages],
                    }
                ]
            });
        } catch (error) {
            console.error('Error creating ticket channel:', error);
            return interaction.reply({ content: `Error creating ticket channel: ${error.message}`, ephemeral: true });
        }

        const userEmbed = new EmbedBuilder()
            .setTitle('Ticket Created')
            .setDescription('Please do not ping staff; it will not expedite your request. Your ticket is now open.')
            .setColor(Colors.Blue)
            .setTimestamp()
            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

        try {
            const userData = await fetchUserData(interaction.user.id);

            if (!userData) {
                userEmbed.addFields(
                    { name: '📡 | Account Info', value: 'This account is not linked with a console account.' }
                );
            } else {
                userEmbed.addFields(
                    { name: '📡 | Account Info', value: `**Username:** ${userData.username}\n**Email:** ||${userData.email}||\n**Link Date:** ${userData.linkDate}\n**Link Time:** ${userData.linkTime}` }
                );
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            userEmbed.addFields(
                { name: '📡 | Account Info', value: 'There was an error fetching account info.' }
            );
        }

        const claimButton = new ButtonBuilder()
            .setCustomId('claim_ticket')
            .setLabel('Claim Ticket')
            .setStyle(ButtonStyle.Primary);

        const actionRow = new ActionRowBuilder().addComponents(claimButton);

        try {
            await channel.send({ content: `${interaction.user} <@&${staffRoleId}>`, embeds: [userEmbed], components: [actionRow] });
            await interaction.reply({ content: `A ticket has been opened for you. Check it out here: ${channel}`, ephemeral: true });
        } catch (error) {
            console.error('Error sending ticket message:', error);
            await interaction.reply({ content: `Error sending ticket message: ${error.message}`, ephemeral: true });
        }

        const filter = (btnInteraction) => btnInteraction.customId === 'claim_ticket' && btnInteraction.channelId === channel.id;
        const collector = channel.createMessageComponentCollector({ filter, time: 3600000 });

        collector.on('collect', async (btnInteraction) => {
            const claimer = btnInteraction.member;

            try {
                await channel.permissionOverwrites.edit(claimer.id, {
                    [PermissionFlagsBits.ViewChannel]: true,
                    [PermissionFlagsBits.SendMessages]: true,
                    [PermissionFlagsBits.ReadMessageHistory]: true,
                });

                await channel.permissionOverwrites.edit(staffRoleId, {
                    [PermissionFlagsBits.ViewChannel]: true,
                    [PermissionFlagsBits.ReadMessageHistory]: true,
                    [PermissionFlagsBits.SendMessages]: false,
                });

                userEmbed.addFields(
                    { name: '🛠️ | Claimed By', value: `${claimer.user.tag} has claimed this ticket.` }
                );

                await btnInteraction.update({ embeds: [userEmbed], components: [] });

                await claimer.send(`You have successfully claimed the ticket in ${interaction.guild.name}: ${channel}.`);

                logTicketAction(`Ticket claimed by ${claimer.user.tag} in channel ${channel.name}`);

            } catch (error) {
                console.error('Error updating permissions for claim:', error);
                await btnInteraction.reply({ content: `Error claiming the ticket: ${error.message}`, ephemeral: true });
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                channel.send('Ticket claim timed out. If you still need help, please open a new ticket.');
            }
        });

        async function logTicketAction(message) {
            const logPath = path.join(__dirname, '../../ticket-logs', `${interaction.guild.id}.log`);
            fs.appendFile(logPath, `${new Date().toISOString()} - ${message}\n`, err => {
                if (err) {
                    console.error('Error logging ticket action:', err);
                }
            });
        }

        if (!fs.existsSync(archiveDir)) {
            fs.mkdirSync(archiveDir);
        }

        archiveTicketCreation(interaction.user.id, channel.id);
    }
};

async function archiveTicketCreation(userId, channelId) {
    const archiveDir = path.join(__dirname, '../../ticket-archives');
    const archivePath = path.join(archiveDir, `${userId}-${channelId}-creation.json`);

    const ticketData = {
        userId,
        channelId,
        createdAt: new Date().toISOString()
    };

    fs.writeFile(archivePath, JSON.stringify(ticketData, null, 2), err => {
        if (err) {
            console.error('Error archiving ticket creation:', err);
        }
    });
}