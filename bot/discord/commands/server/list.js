const { EmbedBuilder } = require('discord.js');
const axios = require("axios");

module.exports = {
    async execute(interaction) {
        let user = interaction.user;
        let userID = user.id;
        const targetUser = interaction.options.getUser('target');

        if (targetUser && interaction.member.roles.cache.has("1250045509868195840")) {
            userID = targetUser.id;
            user = targetUser;
        }

        const userAccount = userData.get(userID);

        if (!userAccount || !userAccount.consoleID) {
            if (userID === interaction.user.id) {
                return interaction.reply({
                    content: `You do not have a panel account linked. Please create or link an account.\n\`/user new\` - Create an account\n\`/user link\` - Link an account`,
                    ephemeral: true
                });
            } else {
                return interaction.reply({
                    content: "That user does not have a panel account linked.",
                    ephemeral: true
                });
            }
        }

        let arr = [];

        try {
            const response = await axios({
                url: `https://panel.bssr-nodes.com/api/application/users/${userAccount.consoleID}?include=servers`,
                method: "GET",
                headers: {
                    Authorization: `Bearer ${config.Pterodactyl.apikey}`,
                    "Content-Type": "application/json",
                    Accept: "Application/vnd.pterodactyl.v1+json",
                },
            });

            const preoutput = response.data.attributes.relationships.servers.data;
            arr.push(...preoutput);

            const format = (server) => {
                return arr.length > 20
                    ? `\`${server.attributes.identifier}\``
                    : `**${server.attributes.name}** (ID: \`${server.attributes.identifier}\`)`;
            };

            const donoNodes = [34, 31, 33, 35, 39];

            const freeServers = arr.filter((server) => !donoNodes.includes(server.attributes.node)).map(format);
            const donoServers = arr.filter((server) => donoNodes.includes(server.attributes.node)).map(format);

            if (arr.length === 0) {
                interaction.reply(`${userID === interaction.user.id ? "You do" : "That user does"} not have any servers.`);
            } else if (arr.length > 70) {
                interaction.reply(`${userID === interaction.user.id ? "You have" : "That user has"} too many servers to display!`);
            } else if (freeServers.length + donoServers.length > 20) {
                const serverListEmbed = new EmbedBuilder()
                    .setTitle(`Server List (${arr.length})`);

                if (userID !== interaction.user.id) serverListEmbed.setAuthor({ name: user.tag, iconURL: user.displayAvatarURL({ format: "png", dynamic: true }) });
                if (freeServers.length > 0) serverListEmbed.addFields({ name: `Servers (${freeServers.length})`, value: freeServers.join(", ") });

                interaction.reply({ embeds: [serverListEmbed] });
            } else {
                const serverListEmbed = new EmbedBuilder()
                    .setTitle(`Server List (${arr.length})`);

                if (userID !== interaction.user.id) serverListEmbed.setAuthor({ name: user.tag, iconURL: user.displayAvatarURL({ format: "png", dynamic: true }) });
                if (freeServers.length > 0) serverListEmbed.addFields({ name: `Servers (${freeServers.length})`, value: freeServers.join("\n") });

                interaction.reply({ embeds: [serverListEmbed] });
            }
        } catch (error) {
            interaction.reply("An error occurred while loading servers.");
        }
    },
};