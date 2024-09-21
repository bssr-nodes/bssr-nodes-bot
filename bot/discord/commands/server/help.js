const { EmbedBuilder } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle("Server Commands")
            .addFields(
                { name: "__**Commands**__", value: `Create a server: \`/server create <type> <servername>\`\nCreate a premium server: \`/server create list\`\nServer Redeem: \`/server redeem <code>\`\nLDelete server: \`/server delete <serverid>\`\nList servers: \`/server list\`\nSee server count: \`/server count\`\nGet Information about a server type: \`/server info <type>\`` }
            );

        await interaction.reply({ embeds: [embed] });
    },
};