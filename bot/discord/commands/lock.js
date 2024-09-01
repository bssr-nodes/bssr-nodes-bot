const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lock')
        .setDescription('Locks specific categories so only certain roles can see the channels'),
    async execute(interaction) {
        const authorizedUserId = '569352110991343616'; // Replace with your Discord User ID
        if (interaction.user.id !== authorizedUserId) {
            return interaction.reply({ content: 'You are not authorized to use this command.', ephemeral: true });
        }

        const categoryIds = ['1244976723800358995', '1250361415244582976']; // Replace with the IDs of the categories you want to lock
        const roleIdsToKeepVisible = ['1250045509868195840']; // Replace with the IDs of the roles that should retain access

        try {
            for (const categoryId of categoryIds) {
                const categoryChannel = interaction.guild.channels.cache.get(categoryId);
                if (!categoryChannel || categoryChannel.type !== ChannelType.GuildCategory) {
                    return interaction.reply({ content: `Category with ID ${categoryId} not found or invalid.`, ephemeral: false });
                }

                categoryChannel.children.cache.forEach(channel => {
                    if (channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildVoice) {
                        channel.permissionOverwrites.set([
                            {
                                id: interaction.guild.roles.everyone.id,
                                deny: [PermissionFlagsBits.ViewChannel],
                            },
                            ...roleIdsToKeepVisible.map(roleId => ({
                                id: roleId,
                                allow: [PermissionFlagsBits.ViewChannel],
                            })),
                        ]);
                    }
                });
            }

            await interaction.reply({ content: 'Channels have been locked successfully.', ephemeral: false });
        } catch (error) {
            console.error('Error locking channels:', error);
            await interaction.reply({ content: 'There was an error locking the channels.', ephemeral: false });
        }
    },
};