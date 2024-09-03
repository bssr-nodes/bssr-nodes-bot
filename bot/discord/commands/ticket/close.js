const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, TextInputBuilder, TextInputStyle, ModalBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    async execute(interaction) {
        try {
            const requiredRole = 'Staff';
            if (!interaction.member.roles.cache.some(role => role.name === requiredRole)) {
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
            const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

            collector.on('collect', async i => {
                console.log(`Button pressed: ${i.customId}`);
                try {
                    if (i.customId === 'confirm_close') {
                        const closingMessageEmbed = new EmbedBuilder()
                            .setTitle('Select a Closing Message')
                            .setDescription('Choose a message to send when closing this ticket.')
                            .setColor('#0099ff');

                        const message1Button = new ButtonBuilder()
                            .setCustomId('message_1')
                            .setLabel('Thanks for reaching out')
                            .setStyle(ButtonStyle.Primary);

                        const message2Button = new ButtonBuilder()
                            .setCustomId('message_2')
                            .setLabel('Support has resolved your issue')
                            .setStyle(ButtonStyle.Primary);

                        const customMessageButton = new ButtonBuilder()
                            .setCustomId('custom_message')
                            .setLabel('Custom Message')
                            .setStyle(ButtonStyle.Primary);

                        const messageRow = new ActionRowBuilder().addComponents(message1Button, message2Button, customMessageButton);

                        await i.update({ embeds: [closingMessageEmbed], components: [messageRow] });

                        const messageCollector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

                        messageCollector.on('collect', async m => {
                            console.log(`Message button pressed: ${m.customId}`);
                            try {
                                if (m.customId === 'message_1') {
                                    const closingMessage = 'Thank you for reaching out to support. Your ticket is now closed.';
                                    await m.update({ content: 'Closing the ticket with the selected message...', components: [] });
                                    await handleTicketClosure(interaction, closingMessage);
                                } else if (m.customId === 'message_2') {
                                    const closingMessage = 'Support has successfully resolved your issue. The ticket is now closed.';
                                    await m.update({ content: 'Closing the ticket with the selected message...', components: [] });
                                    await handleTicketClosure(interaction, closingMessage);
                                } else if (m.customId === 'custom_message') {
                                    const modal = new ModalBuilder()
                                        .setCustomId('custom_message_modal')
                                        .setTitle('Custom Closing Message');

                                    const messageInput = new TextInputBuilder()
                                        .setCustomId('closing_message_input')
                                        .setLabel('Enter your custom closing message')
                                        .setStyle(TextInputStyle.Paragraph);

                                    const modalActionRow = new ActionRowBuilder().addComponents(messageInput);
                                    modal.addComponents(modalActionRow);

                                    await m.showModal(modal);
                                }
                            } catch (error) {
                                console.error('Failed to process message button:', error);
                            }
                        });

                        collector.on('end', collected => {
                            if (collected.size === 0) {
                                interaction.editReply({ content: 'Ticket closure timed out.', components: [] });
                            }
                        });

                        interaction.client.once('interactionCreate', async modalInteraction => {
                            if (!modalInteraction.isModalSubmit() || modalInteraction.customId !== 'custom_message_modal') return;
                            const customMessage = modalInteraction.fields.getTextInputValue('closing_message_input');
                            await modalInteraction.deferReply();
                            await modalInteraction.editReply({ content: 'Closing the ticket with your custom message...', ephemeral: true });
                            await handleTicketClosure(interaction, customMessage);
                        });

                    } else if (i.customId === 'cancel_close') {
                        await i.update({ content: 'Ticket closure canceled.', components: [] });
                    }
                } catch (error) {
                    console.error('Failed to process interaction:', error);
                }
            });

            async function handleTicketClosure(interaction, closingMessage) {
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

                    const tags = ['Resolved', 'Closed'];
                    const autoCloseDelay = 5000;

                    const closeEmbed = new EmbedBuilder()
                        .setDescription(closingMessage)
                        .setColor('#0099ff')
                        .setFooter({ text: `Tags: ${tags.join(', ')}` });

                    await interaction.channel.send({ embeds: [closeEmbed] });

                    const logChannel = interaction.client.channels.cache.get('1251439976546177086');
                    const ticketDuration = Math.abs(new Date() - interaction.channel.createdAt);

                    const logEmbed = new EmbedBuilder()
                        .setTitle('Ticket Closed')
                        .setDescription(`**Ticket:** ${interaction.channel.name}`)
                        .addFields(
                            { name: 'Closed by', value: `${interaction.user.tag}` },
                            { name: 'Duration', value: `${Math.floor(ticketDuration / 1000 / 60)} minutes` },
                            { name: 'Participants', value: `${interaction.channel.members.map(member => member.user.tag).join(', ')}` },
                            { name: 'Tags', value: tags.join(', ') }
                        )
                        .setColor('#0099ff')
                        .setTimestamp();

                    await logChannel.send({ embeds: [logEmbed], files: [transcriptPath] });

                    setTimeout(async () => {
                        await interaction.channel.delete();
                    }, autoCloseDelay);
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