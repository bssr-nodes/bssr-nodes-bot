const { PermissionFlagsBits, EmbedBuilder, ChannelType, Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const categoryId = '1250790663662993579';
        const staffRoleId = '1250045509868195840';

        let category;
        try {
            category = await interaction.guild.channels.fetch(categoryId);
        } catch (error) {
            console.error('Error fetching category:', error);
            return interaction.reply({ content: `Error fetching category: ${error.message}`, ephemeral: true });
        }

        if (!category || category.type !== ChannelType.GuildCategory) {
            return interaction.reply({ content: 'Ticket category not found or invalid.', ephemeral: true });
        }

        const existingTicket = interaction.guild.channels.cache.find(ch => 
            ch.name.includes(interaction.user.username.toLowerCase().replace(' ', '-'))
        );

        if (existingTicket) {
            return interaction.reply({ content: 'You already have an open ticket.', ephemeral: true });
        }

        let channel;
        try {
            channel = await interaction.guild.channels.create({
                name: `${interaction.user.username}-ticket`,
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
            .setDescription('Please do not ping staff, it will not solve your problem faster.')
            .setColor(Colors.Blue)
            .setTimestamp()
            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

        try {
            if (!userData.get || userData.get(interaction.user.id) == null) {
                userEmbed.addFields(
                    { name: '📡 | Account Info', value: 'This account is not linked with a console account.' }
                );
            } else {
                userEmbed.addFields(
                    { name: '📡 | Account Info', value: `**Username:** ${userData.fetch(interaction.user.id + ".username")}\n**Email:** ||${userData.fetch(interaction.user.id + ".email")}||\n**Link Date:** ${userData.fetch(interaction.user.id + ".linkDate")}\n**Link Time:** ${userData.fetch(interaction.user.id + ".linkTime")}` }
                );
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            userEmbed.addFields(
                { name: '📡 | Account Info', value: 'There was an error fetching account info.' }
            );
        }

        // Create claim button
        const claimButton = new ButtonBuilder()
            .setCustomId('claim_ticket')
            .setLabel('Claim Ticket')
            .setStyle(ButtonStyle.Primary);

        const actionRow = new ActionRowBuilder().addComponents(claimButton);

        try {
            await channel.send({ content: `${interaction.user} <@&${staffRoleId}>`, embeds: [userEmbed], components: [actionRow] });
            await interaction.reply({ content: `A ticket has been opened for you, check it out here: ${channel}`, ephemeral: true });
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

                const claimedEmbed = new EmbedBuilder()
                    .setTitle('Ticket Claimed')
                    .setDescription(`This ticket has been claimed by ${claimer.user.tag}. Only they can respond now.`)
                    .setColor(Colors.Green)
                    .setTimestamp()
                    .setFooter({ text: `Claimed by ${claimer.user.tag}`, iconURL: claimer.user.displayAvatarURL() });

                await btnInteraction.update({ embeds: [claimedEmbed], components: [] });

            } catch (error) {
                console.error('Error updating permissions for claim:', error);
                await btnInteraction.reply({ content: `Error claiming the ticket: ${error.message}`, ephemeral: true });
            }
        });
    }
};