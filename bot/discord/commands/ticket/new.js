const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const categoryId = '1250790663662993579';
        const staffRoleId = '1250045509868195840';
        const category = interaction.guild.channels.cache.find(c => c.id === categoryId && c.type === 'GUILD_CATEGORY');

        if (!category) {
            return interaction.reply({ content: 'Ticket category not found.', ephemeral: true });
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
                type: 'GUILD_TEXT',
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
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
                    }
                ]
            });
        } catch (error) {
            console.error('Error creating ticket channel:', error);
            return interaction.reply({ content: 'There was an error creating the ticket.', ephemeral: true });
        }

        const userEmbed = new EmbedBuilder()
            .setTitle('Ticket Created')
            .setDescription('Please do not ping staff, it will not solve your problem faster.')
            .setColor('BLUE')
            .setTimestamp()
            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

        if (userData.get(interaction.user.id) == null) {
            userEmbed.addFields(
                { name: '📡 | Account Info', value: 'This account is not linked with a console account.' }
            );
        } else {
            userEmbed.addFields(
                { name: '📡 | Account Info', value: `**Username:** ${userData.fetch(interaction.user.id + ".username")}\n**Email:** ||${userData.fetch(interaction.user.id + ".email")}||\n**Link Date:** ${userData.fetch(interaction.user.id + ".linkDate")}\n**Link Time:** ${userData.fetch(interaction.user.id + ".linkTime")}` }
            );
        }

        await channel.send({ content: `${interaction.user} <@&${staffRoleId}>`, embeds: [userEmbed] });
        await interaction.reply({ content: `A ticket has been opened for you, check it out here: ${channel}`, ephemeral: true });
    }
};