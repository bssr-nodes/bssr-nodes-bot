const { ButtonBuilder, ButtonStyle, EmbedBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, ModalBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    async execute(interaction) {
        if (!interaction.channel.name.includes('-ticket')) {
            return interaction.reply({ content: 'You can only use this command in a ticket channel.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.client.user.username} | Tickets`, iconURL: interaction.client.user.avatarURL() })
            .setDescription('This ticket will be closed in 5 seconds...')
            .setColor('#0099ff')
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });

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

        setTimeout(async () => {
            await interaction.channel.delete();
        }, 5000);

        const user = interaction.user;

        const feedbackButton = new ButtonBuilder()
            .setCustomId('submit_feedback')
            .setLabel('Leave a Review')
            .setStyle(ButtonStyle.Primary);

        const feedbackRow = new ActionRowBuilder()
            .addComponents(feedbackButton);

        const dmEmbed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.client.user.username} | Tickets`, iconURL: interaction.client.user.avatarURL() })
            .setDescription('Thank you for using our support. Would you like to leave feedback on your ticket?')
            .setColor('#0099ff')
            .setTimestamp();

        try {
            const dmMessage = await user.send({ embeds: [dmEmbed], components: [feedbackRow] });

            const dmCollector = dmMessage.createMessageComponentCollector({ componentType: 'BUTTON', time: 60000 });

            dmCollector.on('collect', async i => {
                if (i.customId === 'submit_feedback') {
                    const feedbackModal = new ModalBuilder()
                        .setCustomId('feedback_modal')
                        .setTitle('Ticket Feedback');

                    const feedbackInput = new TextInputBuilder()
                        .setCustomId('feedback_input')
                        .setLabel('Your Feedback')
                        .setStyle(TextInputStyle.Paragraph)
                        .setPlaceholder('Please provide your feedback...')
                        .setRequired(true);

                    const feedbackRow = new ActionRowBuilder().addComponents(feedbackInput);
                    feedbackModal.addComponents(feedbackRow);

                    await i.showModal(feedbackModal);

                    const filterModal = modalInteraction => modalInteraction.customId === 'feedback_modal' && modalInteraction.user.id === user.id;
                    const modalInteraction = await i.awaitModalSubmit({ filter: filterModal, time: 60000 }).catch(console.error);

                    if (modalInteraction) {
                        const feedback = modalInteraction.fields.getTextInputValue('feedback_input');

                        const feedbackDir = path.join(__dirname, '../../feedback');
                        if (!fs.existsSync(feedbackDir)) {
                            fs.mkdirSync(feedbackDir);
                        }

                        const feedbackPath = path.join(feedbackDir, `${interaction.channel.name}_feedback.txt`);
                        fs.writeFileSync(feedbackPath, `Feedback by ${user.tag} (${user.id}):\n${feedback}\n\n`);

                        await modalInteraction.reply({ content: 'Thank you for your feedback!', ephemeral: true });

                        await logChannel.send({ content: `**Feedback from ${user.tag}:**\n${feedback}`, files: [feedbackPath] });
                    }
                }
            });

            dmCollector.on('end', collected => {
                if (collected.size === 0) {
                    user.send('You did not provide any feedback within the time limit. Thank you!');
                }
            });

        } catch (error) {
            console.error('Failed to send DM to user:', error);
        }
    },
};