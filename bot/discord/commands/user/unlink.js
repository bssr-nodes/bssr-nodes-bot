const { EmbedBuilder } = require('discord.js');

module.exports = {
    async execute(interaction) {
        userData.delete(interaction.user.id);

        const unlinkEmbed = new EmbedBuilder()
            .setTitle('Account Unlinked')
            .setDescription('You have successfully unlinked your account!')
            .setColor('#00FF00')
            .setTimestamp();

        await interaction.reply({ embeds: [unlinkEmbed], ephemeral: true });
    },
};