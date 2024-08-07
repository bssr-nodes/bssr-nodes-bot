const { EmbedBuilder } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const allowedRoleID = "1247882619602075749";
        const ownerId = "569352110991343616";

        if (!interaction.member.roles.cache.has(allowedRoleID)) {
            return await interaction.reply({ content: "ill think about that...... NO.", ephemeral: false });
        }

        let sayMessage = interaction.options.getString('message');

        if (sayMessage.includes('@everyone') || sayMessage.includes('@here')) {
            const owner = await interaction.client.users.fetch(ownerId);
            const blockedEmbed = new EmbedBuilder()
                .setTitle('Say message blocked by security')
                .addField('Admin', interaction.user.tag, true)
                .addField('Message', sayMessage, true)
                .setDescription('The message was blocked due to containing @everyone or @here.')
                .setColor('RED')
                .setTimestamp();
            await owner.send({ embeds: [blockedEmbed] });

            return await interaction.reply({ content: "You cannot use @everyone or @here mentions.", ephemeral: true });
        }

        try {
            const owner = await interaction.client.users.fetch(ownerId);
            const embed = new MessageEmbed()
                .setTitle('Say command used')
                .addField('Admin', interaction.user.tag, true)
                .addField('Message', sayMessage, true)
                .setColor('BLUE')
                .setTimestamp();
            await owner.send({ embeds: [embed] });

            // Send the message to the channel
            await interaction.channel.send(sayMessage);

            // Acknowledge the command
            await interaction.reply({ content: "Message sent!", ephemeral: true });
        } catch (error) {
            console.error("Failed to send message through the bot:", error);
            await interaction.reply({ content: "There was an error sending the message through the bot.", ephemeral: true });
        }
    },
};
