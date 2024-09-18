const axios = require("axios");
const moment = require("moment");
const { PermissionFlagsBits, ChannelType, EmbedBuilder } = require('discord.js');

module.exports = {
    async execute(interaction) {
        await interaction.reply({ content: 'Account linking is disabled.', ephemeral: true });

        const user = interaction.user;
        const server = interaction.guild;

        if (userData.get(user.id) == null) {
            let channel = await server.channels.create({
                name: user.tag,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    {
                        id: server.id,
                        deny: [PermissionFlagsBits.ViewChannel],
                    },
                    {
                        id: user.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
                    },
                ],
            }).catch(console.error);

            await interaction.reply({ content: `Please check <#${channel.id}> to link your account.`, ephemeral: true });

            let category = server.channels.cache.find(c => c.id === "1250359312249917501" && c.type === ChannelType.GuildCategory);
            if (!category) throw new Error("Category channel does not exist");

            await channel.setParent(category.id);

            const embed = new EmbedBuilder()
                .setColor(0x36393e)
                .setDescription("Please enter your console email address or type '1' to link directly")
                .setFooter({ text: "You can type 'cancel' to cancel the request\n**This will take a few seconds to find your account.**" });

            let msg = await channel.send({ embeds: [embed] });

            const filter = m => m.author.id === user.id;
            const collector = channel.createMessageCollector({ filter, time: 60000, max: 1 });

            collector.on("collect", async messageCollected => {
                if (messageCollected.content === "cancel") {
                    await channel.send("Request to link your account canceled.");
                    return setTimeout(() => channel.delete(), 5000);
                }

                if (messageCollected.content === "1") {
                    try {
                        const response = await axios.get("https://panel.bssr-nodes.com/api/application/users/1", {
                            headers: {
                                "Authorization": `Bearer ${config.Pterodactyl.apikey}`,
                                "Content-Type": "application/json",
                                "Accept": "Application/vnd.pterodactyl.v1+json",
                            },
                        });

                        const consoleUser = response.data.attributes;
                        const timestamp = moment().format("HH:mm:ss");
                        const datestamp = moment().format("DD-MM-YYYY");

                        userData.set(user.id, {
                            discordID: user.id,
                            consoleID: consoleUser.id,
                            email: consoleUser.email,
                            username: consoleUser.username,
                            linkTime: timestamp,
                            linkDate: datestamp,
                            domains: [],
                        });

                        const embedStaff = new EmbedBuilder()
                            .setColor('#00FF00')
                            .addFields(
                                { name: "__**Linked Discord account:**__", value: user.id },
                                { name: "__**Linked Console account email:**__", value: consoleUser.email },
                                { name: "__**Linked At: (TIME / DATE):**__", value: `${timestamp} / ${datestamp}` },
                                { name: "__**Linked Console username:**__", value: consoleUser.username },
                                { name: "__**Linked Console ID:**__", value: consoleUser.id }
                            );

                        await channel.send("Account linked!");
                        await client.channels.cache.get("1250044501180026881").send({
                            content: `<@${user.id}> linked their account. Here's some info: `,
                            embeds: [embedStaff],
                        });

                        setTimeout(() => channel.delete(), 5000);

                    } catch (error) {
                        console.error(error);
                        await channel.send("An error occurred while trying to link your account. Please try again later.");
                        setTimeout(() => channel.delete(), 5000);
                    }
                } else {
                    await handleEmailVerification(messageCollected, channel, user, client);
                }
            });
        } else {
            const linkedEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .addFields(
                    { name: `__**Username**__`, value: userData.fetch(`${user.id}.username`) },
                    { name: `__**Linked Date (YYYY-MM-DD)**__`, value: userData.fetch(`${user.id}.linkDate`) },
                    { name: `__**Linked Time**__`, value: userData.fetch(`${user.id}.linkTime`) }
                );

            await interaction.reply({ content: "This account is already linked!", embeds: [linkedEmbed], ephemeral: true });
        }
    },
};

async function handleEmailVerification(messageCollected, channel, user, client) {
    setTimeout(async () => {
        const users = await getUsersFromAPI();
        const consoleUser = users.find(usr => usr.attributes.email === messageCollected.content);

        if (!consoleUser) {
            await channel.send("I can't find a user with that account! \nRemoving channel!");
            setTimeout(() => channel.delete(), 5000);
        } else {
            const code = generateCode(10);

            await channel.send(`Please check the email account for a verification code to complete linking. You have 2 mins. The code is ${code}`);

            const codeCollector = channel.createMessageCollector({
                filter: m => m.author.id === user.id,
                time: 120000,
                max: 2
            });

            codeCollector.on("collect", async message => {
                if (message.content === code) {
                    const timestamp = moment().format("HH:mm:ss");
                    const datestamp = moment().format("DD-MM-YYYY");

                    userData.set(user.id, {
                        discordID: user.id,
                        consoleID: consoleUser.attributes.id,
                        email: consoleUser.attributes.email,
                        username: consoleUser.attributes.username,
                        linkTime: timestamp,
                        linkDate: datestamp,
                        domains: [],
                    });

                    const embedStaff = new EmbedBuilder()
                        .setColor('#00FF00')
                        .addFields(
                            { name: "__**Linked Discord account:**__", value: user.id },
                            { name: "__**Linked Console account email:**__", value: consoleUser.attributes.email },
                            { name: "__**Linked At: (TIME / DATE):**__", value: `${timestamp} / ${datestamp}` },
                            { name: "__**Linked Console username:**__", value: consoleUser.attributes.username },
                            { name: "__**Linked Console ID:**__", value: consoleUser.attributes.id }
                        );

                    await channel.send("Account linked!");
                    await client.channels.cache.get("1250044501180026881").send({
                        content: `<@${user.id}> linked their account. Here's some info: `,
                        embeds: [embedStaff],
                    });

                    setTimeout(() => channel.delete(), 5000);
                } else {
                    await channel.send("Code is incorrect. Linking cancelled!\n\nRemoving channel!");
                    setTimeout(() => channel.delete(), 2000);
                }
            });
        }
    }, 10000);
}

function generateCode(length) {
    const characters = "23456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}