const { ButtonBuilder, ButtonStyle, EmbedBuilder, ActionRowBuilder, TextInputBuilder, ModalBuilder, TextInputStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    async execute(interaction) {
        if (!interaction.channel.name.includes('-ticket')) {
            return interaction.reply({ content: 'You can only use this command in a ticket channel.', ephemeral: true });
        }

        const closeButton = new ButtonBuilder()
            .setCustomId('close_ticket')
            .setLabel('Close')
            .setStyle(ButtonStyle.Success);

        const cancelButton = new ButtonBuilder()
            .setCustomId('cancel_ticket')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder()
            .addComponents(closeButton, cancelButton);

        const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.client.user.username} | Tickets`, iconURL: interaction.client.user.avatarURL() })
            .setDescription('Are you sure you want to close this ticket?')
            .setColor('#0099ff')
            .setTimestamp();

        const msg = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

        const filter = i => ['close_ticket', 'cancel_ticket'].includes(i.customId) && i.user.id === interaction.user.id;

        const collector = msg.createMessageComponentCollector({ filter, time: 30000 });

        collector.on('collect', async i => {
            if (i.customId === 'close_ticket') {
                await i.reply({ content: "I'm closing this ticket.", ephemeral: false });

                const messages = await interaction.channel.messages.fetch();
                const script = messages
                    .reverse()
                    .map(m => `${m.author.tag}: ${m.attachments.size > 0 ? m.attachments.first().proxyURL : m.content}`)
                    .join('\n');

                const transcriptDir = path.join(__dirname, '../../transcripts');
                if (!fs.existsSync(transcriptDir)) {
                    fs.mkdirSync(transcriptDir);
                }

                const transcriptPath = path.join(transcriptDir, `${interaction.channel.name}.txt`);
                fs.writeFileSync(transcriptPath, script);

                const logChannel = interaction.client.channels.cache.get('1251439976546177086');
                const logEmbed = new EmbedBuilder()
                    .setAuthor({ name: `${interaction.client.user.username} | Tickets`, iconURL: interaction.client.user.avatarURL() })
                    .setDescription('New ticket is closed!')
                    .addFields(
                        { name: '🚧 | Info', value: `**Closed by:** \`${interaction.user.tag} (${interaction.user.id})\`\n> **Ticket Name:** \`${interaction.channel.name}\`` }
                    )
                    .setThumbnail('https://cdn.discordapp.com/emojis/860696559573663815.png?v=1')
                    .setColor('#0099ff')
                    .setTimestamp();

                await logChannel.send({ embeds: [logEmbed], files: [transcriptPath] });

                const disabledRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('close_ticket')
                            .setLabel('Closed')
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(true),
                        new ButtonBuilder()
                            .setCustomId('cancel_ticket')
                            .setLabel('Canceled')
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(true)
                    );

                await msg.edit({ components: [disabledRow] });

                const feedbackModal = new ModalBuilder()
                    .setCustomId('feedback_modal')
                    .setTitle('Ticket Feedback');

                const feedbackInput = new TextInputBuilder()
                    .setCustomId('feedback_input')
                    .setLabel('Please provide your feedback about the support you received:')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true);

                const feedbackRow = new ActionRowBuilder().addComponents(feedbackInput);
                feedbackModal.addComponents(feedbackRow);

                await i.showModal(feedbackModal);

                const feedbackFilter = interaction => interaction.customId === 'feedback_modal' && interaction.user.id === i.user.id;
                const feedbackCollector = interaction.channel.createMessageComponentCollector({ filter: feedbackFilter, time: 30000 });

                feedbackCollector.on('collect', async feedbackInteraction => {
                    const feedback = feedbackInteraction.fields.getTextInputValue('feedback_input');

                    const feedbackLogEmbed = new EmbedBuilder()
                        .setAuthor({ name: 'Feedback Received', iconURL: interaction.client.user.avatarURL() })
                        .setDescription(`Feedback from ${feedbackInteraction.user.tag} (${feedbackInteraction.user.id})`)
                        .addFields({ name: 'Feedback', value: feedback })
                        .setColor(Colors.Green)
                        .setTimestamp();

                    await logChannel.send({ embeds: [feedbackLogEmbed] });

                    await feedbackInteraction.reply({ content: 'Thank you for your feedback!', ephemeral: true });

                    setTimeout(() => {
                        interaction.channel.delete();
                    }, 5000);
                });

                feedbackCollector.on('end', collected => {
                    if (collected.size === 0) {
                        interaction.editReply({ content: 'No feedback received. The ticket will now be closed.', components: [] });
                        setTimeout(() => {
                            interaction.channel.delete();
                        }, 5000);
                    }
                });

            } else if (i.customId === 'cancel_ticket') {
                await i.reply({ content: 'The ticket will not be closed.', ephemeral: false });

                const disabledRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('close_ticket')
                            .setLabel('Closed')
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(true),
                        new ButtonBuilder()
                            .setCustomId('cancel_ticket')
                            .setLabel('Canceled')
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(true)
                    );

                await msg.edit({ components: [disabledRow] });
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.editReply({ content: 'No response received in time. This ticket will not be closed.', components: [] });
            }
        });
    },
};