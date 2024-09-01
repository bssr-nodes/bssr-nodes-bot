<<<<<<< HEAD
const { EmbedBuilder } = require('discord.js');

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
                        deny: ['VIEW_CHANNEL'],
                    },
                    {
                        id: interaction.user.id,
                        allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
                    },
                    {
                        id: staffRoleId,
                        allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
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
=======
const Discord = require("discord.js");

exports.run = async (client, message, args) => {
    let category = message.guild.channels.cache.find((c) => c.id === "1250790663662993579" && c.type === "category");
    if (!category) return;

    if (
        message.guild.channels.cache.find((ch) =>
            ch.name.includes(message.author.username.toLowerCase().replace(" ", "-"))
        )
    )
        return message.reply(`You already have an open ticket.`);

    let channel = await message.guild.channels
        .create(message.author.username + "-ticket", "text")

        .catch((err) => {
            console.log(err);
        });

    await channel.setParent(category.id).catch(console.error);

    setTimeout(() => {
        channel.updateOverwrite(message.guild.roles.everyone, {
            SEND_MESSAGES: false,
            VIEW_CHANNEL: false,
        });

        channel.updateOverwrite(message.author.id, {
            SEND_MESSAGES: true,
            VIEW_CHANNEL: true,
            READ_MESSAGE_HISTORY: true,
        });

        channel.updateOverwrite("1250045509868195840", {
            SEND_MESSAGES: true,
            VIEW_CHANNEL: true,
            READ_MESSAGE_HISTORY: true,
        });
    }, 1000);

    message.reply(`A ticket has been opened for you, check it out here: ${channel}`);

    if (userData.get(message.author.id) == null) {
        const embed = new Discord.MessageEmbed()
            .setAuthor(`${client.user.username} | Tickets`, client.user.avatarURL())
            .setDescription("Please do not ping staff, it will not solve your problem faster.")
            .addField(`📡 | Account Info`, `This account is not linked with a console account.`)
            .setColor(message.guild.me.displayHexColor)
            .setTimestamp();
        channel.send(`${message.author} <@&1250045509868195840>`, embed);
    } else {
        const embed = new Discord.MessageEmbed()
            .setAuthor(`${client.user.username} | Tickets`, client.user.avatarURL())
            .setDescription(`Please do not ping staff, it will not solve your problem faster.`)
            .addField(
                `📡 | Account Info`,
                `**Username:** ${userData.fetch(message.author.id + ".username")}\n**Email:** ||${userData.fetch(
                    message.author.id + ".email"
                )}||\n**Link Date:** ${userData.fetch(
                    message.author.id + ".linkDate"
                )}\n**Link Time:** ${userData.fetch(message.author.id + ".linkTime")}`
            )
            .setColor(message.guild.me.displayHexColor)
            .setTimestamp();
        channel.send(`${message.author} <@&1250045509868195840>`, embed);
>>>>>>> 469902f (push the changes i made on ptero)
    }
};