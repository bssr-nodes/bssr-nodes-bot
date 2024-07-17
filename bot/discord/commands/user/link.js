const axios = require("axios");
const moment = require("moment");
const Discord = require("discord.js");

exports.run = async (client, message, args) => {

    
    if (userData.get(message.author.id) == null) {
        const server = message.guild;

        let channel = await server.channels.create(message.author.tag, {
            type: 'text',
            permissionOverwrites: [
                {
                    id: message.guild.id,
                    deny: ['VIEW_CHANNEL'],
                },
                {
                    id: message.author.id,
                    allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
                },
            ],
        }).catch(console.error);

        message.reply(`Please check <#${channel.id}> to link your account.`);

        let category = server.channels.cache.find((c) => c.id === "1250359312249917501" && c.type === "category");
        if (!category) throw new Error("Category channel does not exist");

        await channel.setParent(category.id);

        channel.updateOverwrite(message.author, {
            VIEW_CHANNEL: true,
            SEND_MESSAGES: true,
            READ_MESSAGE_HISTORY: true,
        });

        let msg = await channel.send(message.author, {
            embed: new Discord.MessageEmbed()
                .setColor(0x36393e)
                .setDescription("Please enter your console email address or type '1' to link directly")
                .setFooter(
                    "You can type 'cancel' to cancel the request \n**This will take a few seconds to find your account.**"
                ),
        });

        const collector = new Discord.MessageCollector(channel, (m) => m.author.id === message.author.id, {
            time: 60000,
            max: 1,
        });

        collector.on("collect", async (messagecollected) => {
            if (messagecollected.content === "cancel") {
                return msg.edit("Request to link your account canceled.", null).then(channel.delete());
            }

            if (messagecollected.content === "1") {
                try {
                    const response = await axios.get("https://panel.bssr-nodes.com/api/application/users/3", {
                        headers: {
                            "Authorization": `Bearer ${config.Pterodactyl.apikey}`,
                            "Content-Type": "application/json",
                            "Accept": "Application/vnd.pterodactyl.v1+json",
                        },
                    });

                    const consoleUser = response.data.attributes;

                    const timestamp = `${moment().format("HH:mm:ss")}`;
                    const datestamp = `${moment().format("DD-MM-YYYY")}`;
                    userData.set(`${message.author.id}`, {
                        discordID: message.author.id,
                        consoleID: consoleUser.id,
                        email: consoleUser.email,
                        username: consoleUser.username,
                        linkTime: timestamp,
                        linkDate: datestamp,
                        domains: [],
                    });

                    let embedstaff = new Discord.MessageEmbed()
                        .setColor("Green")
                        .addField("__**Linked Discord account:**__", message.author.id)
                        .addField("__**Linked Console account email:**__", consoleUser.email)
                        .addField("__**Linked At: (TIME / DATE)**__", timestamp + " / " + datestamp)
                        .addField("__**Linked Console username:**__", consoleUser.username)
                        .addField("__**Linked Console ID:**__", consoleUser.id);

                    channel.send("Account linked!").then(
                        client.channels.cache
                            .get("1250044501180026881")
                            .send(
                                `<@${message.author.id}> linked their account. Here's some info: `,
                                embedstaff
                            ),
                        setTimeout(() => {
                            channel.delete();
                        }, 5000)
                    );

                } catch (error) {
                    console.error(error);
                    channel.send("An error occurred while trying to link your account. Please try again later.");
                    setTimeout(() => {
                        channel.delete();
                    }, 5000);
                }
            } else {
                // Existing code for email verification
                setTimeout(async () => {
                    const consoleUser = users.find((usr) =>
                        usr.attributes ? usr.attributes.email === messagecollected.content : false
                    );

                    if (!consoleUser) {
                        channel.send("I can't find a user with that account! \nRemoving channel!");
                        setTimeout(() => {
                            channel.delete();
                        }, 5000);
                    } else {
                        function codegen(length) {
                            let result = "";
                            let characters = "23456789";
                            let charactersLength = characters.length;
                            for (let i = 0; i < length; i++) {
                                result += characters.charAt(Math.floor(Math.random() * charactersLength));
                            }
                            return result;
                        }

                        const code = codegen(10);

                        channel.send(
                            `Please check the email account for a verification code to complete linking. You have 2mins. The code is ${code}`
                        );

                        const codeCollector = new Discord.MessageCollector(
                            channel,
                            (m) => m.author.id === message.author.id,
                            {
                                time: 120000,
                                max: 2,
                            }
                        );

                        codeCollector.on("collect", (message) => {
                            if (message.content === code) {
                                const timestamp = `${moment().format("HH:mm:ss")}`;
                                const datestamp = `${moment().format("DD-MM-YYYY")}`;
                                userData.set(`${message.author.id}`, {
                                    discordID: message.author.id,
                                    consoleID: consoleUser.attributes.id,
                                    email: consoleUser.attributes.email,
                                    username: consoleUser.attributes.username,
                                    linkTime: timestamp,
                                    linkDate: datestamp,
                                    domains: [],
                                });

                                let embedstaff = new Discord.MessageEmbed()
                                    .setColor("Green")
                                    .addField("__**Linked Discord account:**__", message.author.id)
                                    .addField("__**Linked Console account email:**__", consoleUser.attributes.email)
                                    .addField("__**Linked At: (TIME / DATE)**__", timestamp + " / " + datestamp)
                                    .addField("__**Linked Console username:**__", consoleUser.attributes.username)
                                    .addField("__**Linked Console ID:**__", consoleUser.attributes.id);

                                channel.send("Account linked!").then(
                                    client.channels.cache
                                        .get("1250044501180026881")
                                        .send(
                                            `<@${message.author.id}> linked their account. Here's some info: `,
                                            embedstaff
                                        ),
                                    setTimeout(() => {
                                        channel.delete();
                                    }, 5000)
                                );
                            } else {
                                channel.send("Code is incorrect. Linking cancelled!\n\nRemoving channel!");
                                setTimeout(() => {
                                    channel.delete();
                                }, 2000);
                            }
                        });
                    }
                }, 10000);
            }
        });
    } else {
        let embed = new Discord.MessageEmbed()
            .setColor(`GREEN`)
            .addField(`__**Username**__`, userData.fetch(message.author.id + ".username"))
            .addField(`__**Linked Date (YYYY-MM-DD)**__`, userData.fetch(message.author.id + ".linkDate"))
            .addField(`__**Linked Time**__`, userData.fetch(message.author.id + ".linkTime"));
        await message.reply("This account is linked!", embed);
    }
};
