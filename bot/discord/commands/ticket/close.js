const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    async execute(interaction) {
        try {
            // Configuration
            const config = {
                requiredRoles: ['Staff'],
                logChannelId: '1251439976546177086',
                timeoutDuration: 15000,
                autoCloseDelay: 5000
            };

            const hasRequiredRole = config.requiredRoles.some(role => 
                interaction.member.roles.cache.some(r => r.name === role)
            );

            if (!hasRequiredRole) {
                return interaction.reply({ content: 'You do not have the necessary role to close this ticket.', ephemeral: true });
            }

            await interaction.deferReply({ ephemeral: true });

            const confirmationEmbed = new EmbedBuilder()
                .setTitle('Confirm Ticket Closure')
                .setDescription('Are you sure you want to close this ticket? This action cannot be undone.')
                .setColor('#ffcc00');

            const confirmButton = new ButtonBuilder()
                .setCustomId('confirm_close')
                .setLabel('Yes, close it')
                .setStyle(ButtonStyle.Danger);

            const cancelButton = new ButtonBuilder()
                .setCustomId('cancel_close')
                .setLabel('No, keep it open')
                .setStyle(ButtonStyle.Secondary);

            const actionRow = new ActionRowBuilder().addComponents(confirmButton, cancelButton);

            await interaction.editReply({ embeds: [confirmationEmbed], components: [actionRow] });

            const filter = i => ['confirm_close', 'cancel_close'].includes(i.customId) && i.user.id === interaction.user.id;
            const collector = interaction.channel.createMessageComponentCollector({ filter, time: config.timeoutDuration });

            collector.on('collect', async i => {
                try {
                    if (i.customId === 'confirm_close') {
                        await i.update({ content: 'Closing the ticket...', components: [] });
                        await handleTicketClosure(interaction);
                    } else if (i.customId === 'cancel_close') {
                        await i.update({ content: 'Ticket closure canceled.', components: [] });
                    }
                } catch (error) {
                    console.error('Failed to process interaction:', error);
                }
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    interaction.editReply({ content: 'Ticket closure timed out.', components: [] });
                }
            });

            async function handleTicketClosure(interaction) {
                try {
                    const messages = await interaction.channel.messages.fetch();
                    const transcript = messages
                        .reverse()
                        .map(m => `${m.createdAt.toISOString()} - ${m.author.tag}: ${m.attachments.size > 0 ? `[Attachment](${m.attachments.first().proxyURL})` : m.content}`)
                        .join('\n');

                    const transcriptDir = path.join(__dirname, '../../transcripts');
                    if (!fs.existsSync(transcriptDir)) {
                        fs.mkdirSync(transcriptDir);
                    }

                    const transcriptPath = path.join(transcriptDir, `${interaction.channel.name}.txt`);
                    fs.writeFileSync(transcriptPath, transcript);

                    const closingMessage = 'The ticket has been closed.';
                    const closeEmbed = new EmbedBuilder()
                        .setDescription(closingMessage)
                        .setColor('#0099ff');

                    await interaction.channel.send({ embeds: [closeEmbed] });

                    const logChannel = interaction.client.channels.cache.get(config.logChannelId);
                    const ticketDuration = Math.abs(new Date() - interaction.channel.createdAt);
                    const logEmbed = new EmbedBuilder()
                        .setTitle('Ticket Closed')
                        .setDescription(`**Ticket:** ${interaction.channel.name}`)
                        .addFields(
                            { name: 'Closed by', value: `${interaction.user.tag}` },
                            { name: 'Duration', value: `${Math.floor(ticketDuration / 1000 / 60)} minutes` },
                            { name: 'Participants', value: `${interaction.channel.members.map(member => member.user.tag).join(', ')}` },
                            { name: 'Channel ID', value: `${interaction.channel.id}` },
                            { name: 'Creation Date', value: `${interaction.channel.createdAt.toISOString()}` }
                        )
                        .setColor('#0099ff')
                        .setTimestamp();

                    await logChannel.send({ embeds: [logEmbed], files: [transcriptPath] });

                    await interaction.channel.permissionOverwrites.edit(interaction.guild.id, {
                        VIEW_CHANNEL: false,
                    });

                    setTimeout(async () => {
                        await interaction.channel.delete();
                    }, config.autoCloseDelay);

                } catch (error) {
                    console.error('Failed to handle ticket closure:', error);
                }
            }
        } catch (error) {
            console.error('Failed to execute close command:', error);
            interaction.reply({ content: 'An error occurred while processing the request.', ephemeral: true });
        }
    },
};