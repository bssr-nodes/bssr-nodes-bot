const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('eval')
        .setDescription('Evaluates JavaScript code')
        .addStringOption(option =>
            option.setName('code')
                .setDescription('The code to evaluate')
                .setRequired(true)),
    async execute(interaction) {
        const code = interaction.options.getString('code');
        const cont = code;

        if (["569352110991343616", "1131236182899052696", "871722786006138960", "1080213687073251461"].includes(interaction.user.id)) {
            function clean(text) {
                if (typeof text !== "string")
                    text = require("util").inspect(text, { depth: 0 });
                let rege = new RegExp(interaction.client.token, "gi");
                let rege2 = new RegExp("6 + 9", "gi");
                text = text
                    .replace(/`/g, "`" + String.fromCharCode(8203))
                    .replace(/@/g, "@" + String.fromCharCode(8203))
                    .replace(
                        rege,
                        "(node:800) UnhandledPromiseRejectionWarning: Error: Incorrect login details were provided."
                    )
                    .replace(rege2, "69");
                return text;
            }
            await interaction.reply("Evaluating...");

            try {
                let evaled = eval(code);

                if (typeof evaled !== "string") {
                    evaled = require("util").inspect(evaled);
                }
                if (evaled.length > 2000) {
                    try {
                        let evalcode1 = new MessageEmbed()
                            .setAuthor(`Eval by ${interaction.user.tag}`, `https://cdn.discordapp.com/emojis/314405560701419520.png`)
                            .setDescription(`**Input:**\n\n\`\`\`js\n${cont}\`\`\``, true)
                            .addField(
                                `\u200b`,
                                `**Output:**\n\n\`\`\`js\nOutput too long, logged to ${__dirname}\\eval.txt\`\`\``,
                                true
                            )
                            .setColor(0x00ff00)
                            .setFooter(`Node.js - Time taken: ${Date.now() - interaction.createdTimestamp} ms`);
                        await interaction.editReply({ embeds: [evalcode1] });
                        fs.writeFileSync(`eval.txt`, `${clean(evaled)}`);
                        await interaction.followUp({ files: ["eval.txt"] });
                    } catch (err) {
                        let errorcode1 = new MessageEmbed()
                            .setAuthor(`Eval by ${interaction.user.tag}`, `https://cdn.discordapp.com/emojis/314405560701419520.png`)
                            .setDescription(`**Input:**\n\n\`\`\`js\n${cont}\`\`\``, true)
                            .addField(
                                `\u200b`,
                                `**Output:**\n\n\`\`\`js\nOutput too long, logged to ${__dirname}\\eval.txt\`\`\``,
                                true
                            )
                            .setColor(0xff0000)
                            .setFooter(`${Date.now() - interaction.createdTimestamp}ms`);
                        await interaction.editReply({ embeds: [errorcode1] });
                        fs.writeFileSync(`eval.txt`, `${clean(err)}`);
                    }
                } else {
                    let evalcode = new MessageEmbed()
                        .setAuthor(`Eval by ${interaction.user.tag}`, `https://cdn.discordapp.com/emojis/314405560701419520.png`)
                        .setDescription(`**:inbox_tray: Input:**\n\n\`\`\`js\n${cont}\`\`\``, true)
                        .addField(`\u200b`, `**:outbox_tray: Output:**\n\n\`\`\`js\n${clean(evaled)}\`\`\``, true)
                        .setColor(0x00ff00)
                        .setFooter(`${Date.now() - interaction.createdTimestamp}ms`);
                    await interaction.editReply({ embeds: [evalcode] });
                }
            } catch (err) {
                let errorcode = new MessageEmbed()
                    .setAuthor(`Eval by ${interaction.user.tag}`, `https://cdn.discordapp.com/emojis/314405560701419520.png`)
                    .setDescription(`**:inbox_tray: Input:**\n\n\`\`\`js\n${cont}\`\`\``, true)
                    .addField(`\u200b`, `**:outbox_tray: Output:**\n\n\`\`\`js\n${clean(err)}\`\`\``, true)
                    .setColor(0xff0000)
                    .setFooter(`${Date.now() - interaction.createdTimestamp}ms`);
                await interaction.editReply({ embeds: [errorcode] });
            }
        } else {
            await interaction.reply("Evaluating...");

            const responses = [
                "SyntaxError: Unexpected token F in JSON at position 420",
                "SyntaxError: Unexpected token L in JSON at position 69",
                "SyntaxError: Unexpected identifier",
                "UnhandledPromiseRejectionWarning: DiscordAPIError: Missing Permissions",
                "TypeError: Cannot read property 'messages' of undefined",
                "UnhandledPromiseRejectionWarning: MongoError: bad auth: Authentication failed.",
                `TypeError: Cannot read property '${args.join(" ")}' of undefined`,
                "Uncaught LogicError: You don't smell like a bot admin",
                "TypeError: Cannot read property 'skill issue'. Property 'skill issue' undefined.",
                "Uncaught (in promise): Can't promise about this"
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            const errorcodefake = new MessageEmbed()
                .setAuthor(interaction.user.tag, `https://cdn.discordapp.com/emojis/314405560701419520.png`)
                .setDescription(`:inbox_tray: **Input:**\n\n\`\`\`js\n${cont}\`\`\``, true)
                .addField(
                    `\u200b`,
                    `:outbox_tray: **Output:**\`\`\`\n${randomResponse}\`\`\``,
                    true
                )
                .setColor(0xff0000)
                .setFooter(`${Date.now() - interaction.createdTimestamp}ms`);
            await interaction.editReply({ embeds: [errorcodefake] });
        }
    }
};