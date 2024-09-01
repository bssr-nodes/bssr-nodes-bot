const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlock')
        .setDescription('Unlocks specific categories to make channels visible to everyone'),
    async execute(interaction) {
        const authorizedUserId = '569352110991343616'; 
        if (interaction.user.id !== authorizedUserId) {
            return interaction.reply({ content: 'You are not authorized to use this command.', ephemeral: true });
        }

        const categoryIds = ['1244976723800358995', '1250361415244582976']; 

        try {
            for (const categoryId of categoryIds) {
                const categoryChannel = interaction.guild.channels.cache.get(categoryId);
                if (!categoryChannel || categoryChannel.type !== ChannelType.GuildCategory) {
                    // Reply once and exit if a category isn't found
                    return interaction.reply({ content: `Category with ID ${categoryId} not found or invalid.`, ephemeral: false });
                }

                categoryChannel.children.cache.forEach(channel => {
                    if (channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildVoice) {
                        // Unlock the channel by removing all specific permission overwrites and allowing everyone to view it
                        channel.permissionOverwrites.set([
                            {
                                id: interaction.guild.roles.everyone.id,
                                allow: [PermissionFlagsBits.ViewChannel],
                            },
                        ]);
                    }
                });
            }

            await interaction.reply({ content: 'Channels have been unlocked successfully.', ephemeral: false });
        } catch (error) {
            console.error('Error unlocking channels:', error);
            await interaction.reply({ content: 'There was an error unlocking the channels.', ephemeral: false });
        }
    },
};