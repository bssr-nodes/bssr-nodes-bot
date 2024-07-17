const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const axios = require('axios');

exports.run = async (client, message, args) => {
    const userId = message.author.id;

    const warningEmbed = new EmbedBuilder()
        .setTitle('Warning')
        .setDescription('Are you sure you want to delete your panel account? This action is irreversible.')
        .setColor('RED');

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('confirmDelete')
                .setLabel('Confirm')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('cancelDelete')
                .setLabel('Cancel')
                .setStyle(ButtonStyle.Secondary)
        );

    const confirmMessage = await message.reply({ embeds: [warningEmbed], components: [row] });

    const filter = i => i.user.id === userId;

    const collector = confirmMessage.createMessageComponentCollector({ filter, time: 15000 });

    collector.on('collect', async i => {
        if (i.customId === 'confirmDelete') {
            try {
                // API call to delete the user account
                const response = await axios({
                    url: `${config.Pterodactyl.hosturl}/api/application/users/${userId}`,
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${config.Pterodactyl.apikey}`,
                        'Content-Type': 'application/json',
                        'Accept': 'Application/vnd.pterodactyl.v1+json'
                    }
                });

                userData.delete(userId);
                await i.update({ content: 'Your panel account has been successfully deleted and unlinked.', components: [], embeds: [] });
            } catch (error) {
                console.error('Error deleting user account:', error);
                await i.update({ content: 'An error occurred while deleting your panel account.', components: [], embeds: [] });
            }
        } else if (i.customId === 'cancelDelete') {
            await i.update({ content: 'Account deletion canceled.', components: [], embeds: [] });
        }
    });

    collector.on('end', collected => {
        if (collected.size === 0) {
            confirmMessage.edit({ content: 'Account deletion timed out.', components: [], embeds: [] });
        }
    });
};