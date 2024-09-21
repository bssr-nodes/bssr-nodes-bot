const axios = require("axios");
const humanizeDuration = require("humanize-duration");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const serverID = interaction.options.getString('serverid');
        const userId = interaction.user.id;

        if (!client.cooldown[userId]) {
            client.cooldown[userId] = { delete: null };
        }

        if (client.cooldown[userId].delete && client.cooldown[userId].delete > Date.now()) {
            return interaction.reply({
                content: `You're currently on cooldown, please wait ${humanizeDuration(client.cooldown[userId].delete - Date.now(), { round: true })}`,
                ephemeral: true,
            });
        }

        client.cooldown[userId].delete = Date.now() + 3 * 1000;

        if (!serverID.match(/[0-9a-z]+/i)) {
            return interaction.reply({ content: 'Please only use English characters.', ephemeral: true });
        }

        const cleanedServerID = serverID.replace('https://panel.bssr-nodes.com/server/', '').match(/[0-9a-z]+/i)[0];

        await interaction.reply(`Please wait while the server \`${cleanedServerID}\` is checked.`);

        axios({
            url: `https://panel.bssr-nodes.com/api/application/users/${userData.get(userId).consoleID}?include=servers`,
            method: 'GET',
            headers: {
                Authorization: `Bearer ${config.Pterodactyl.apikey}`,
                'Content-Type': 'application/json',
                Accept: 'Application/vnd.pterodactyl.v1+json',
            },
        })
        .then(async (response) => {
            const servers = response.data.attributes.relationships.servers.data;
            const server = servers.find(srv => srv.attributes && srv.attributes.identifier === cleanedServerID);

            if (!server) {
                return interaction.editReply("I cannot find that server.");
            }

            if (server.attributes.user === userData.get(userId).consoleID) {
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('confirm-delete')
                            .setLabel('Confirm')
                            .setStyle(ButtonStyle.Danger),
                        new ButtonBuilder()
                            .setCustomId('cancel-delete')
                            .setLabel('Cancel')
                            .setStyle(ButtonStyle.Secondary)
                    );

                await interaction.editReply({
                    content: `Are you sure you want to delete \`${server.attributes.name.split("@").join("@​")}\`?\n**This action is irreversible!**`,
                    components: [row],
                });

                const filter = (i) => i.user.id === interaction.user.id;
                const collector = interaction.channel.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });

                collector.on('collect', async (buttonInteraction) => {
                    if (buttonInteraction.customId === 'confirm-delete') {
                        await buttonInteraction.update({ content: 'Working...', components: [] });

                        axios({
                            url: `${config.Pterodactyl.hosturl}/api/application/servers/${server.attributes.id}/force`,
                            method: 'DELETE',
                            headers: {
                                Authorization: `Bearer ${config.Pterodactyl.apikey}`,
                                'Content-Type': 'application/json',
                                Accept: 'Application/vnd.pterodactyl.v1+json',
                            },
                        })
                        .then(() => {
                            buttonInteraction.editReply('Server deleted!');

                            if ([31, 34, 33, 45].includes(server.attributes.node)) {
                                userPrem.set(`${userId}.used`, userPrem.fetch(userId).used - 1);
                            }

                            collector.stop();
                        })
                        .catch(() => {
                            buttonInteraction.editReply('An error occurred with the Panel. Please try again later.');
                            collector.stop();
                        });
                    } else if (buttonInteraction.customId === 'cancel-delete') {
                        await buttonInteraction.update({ content: 'Server deletion cancelled!', components: [] });
                        collector.stop();
                    }
                });

                collector.on('end', () => {
                    if (!collector.ended) {
                        interaction.editReply({ content: 'The confirmation timed out.', components: [] });
                    }
                });
            } else {
                return interaction.editReply("You do not own that server so you cannot delete it.");
            }
        })
        .catch(() => interaction.editReply("An error occurred while fetching that server."));
    },
};