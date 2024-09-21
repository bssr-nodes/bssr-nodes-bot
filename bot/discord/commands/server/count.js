const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const premiumNodes = [31, 33, 34, 35, 39];

module.exports = {
    async execute(interaction) {
        // Get the user from the interaction, or default to the command invoker
        const userOption = interaction.options.getUser('user');
        const userId = userOption ? userOption.id : interaction.user.id;

        // Fetch user data (Replace with your logic to get console ID)
        let user = userPrem.fetch(userId);
        if (!user) user = {};

        try {
            // Make API call to fetch user's servers
            const response = await axios({
                url: `https://panel.bssr-nodes.com/api/application/users/${userData.get(userId).consoleID}?include=servers`,
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${config.Pterodactyl.apikey}`,
                    'Content-Type': 'application/json',
                    Accept: 'Application/vnd.pterodactyl.v1+json',
                },
            });

            const preoutput = response.data.attributes.relationships.servers.data;
            const premiumServers = preoutput.filter(x => premiumNodes.includes(x.attributes.node)).length;
            const freeServers = preoutput.length - premiumServers;

            // Create an embed with server count details
            const embed = new EmbedBuilder()
                .setDescription(`${freeServers} Server count${freeServers === 1 ? '' : 's'}`)
                .setColor('#0000FF');

            // Reply with the embed
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching servers:', error);
            await interaction.reply('An error occurred while loading servers.');
        }
    },
};
