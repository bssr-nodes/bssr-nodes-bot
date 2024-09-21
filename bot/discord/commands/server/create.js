const { EmbedBuilder } = require('discord.js');
const serverCreateSettings = require('../../../../createData');

module.exports = {
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const serverName = interaction.options.getString('name') || 'Untitled Server (settings -> server name)';
        const type = interaction.options.getString('type')?.toLowerCase();

        const helpEmbed = new EmbedBuilder()
            .setColor('RED')
            .setDescription(
                `List of servers: (use /server create <type> <name>)\n\n*Please note that some nodes might have trouble connecting, which may lead to errors.*\n`
            )
            .addFields(
                { name: '__**Languages:**__', value: 'NodeJS \nBun \nPython \nAIO', inline: true },
                { name: '__**Databases:**__', value: 'Postgres16 \nMongoDB \nRedis', inline: true },
                { name: '__**Software:**__', value: 'Uptimekuma', inline: true },
            )
            .setFooter({ text: 'Example: /server create NodeJS Testing Server' });

        const types = {
            storage: serverCreateSettings.createParams(serverName, consoleID.consoleID).storage,
            nginx: serverCreateSettings.createParams(serverName, consoleID.consoleID).nginx,
            nodejs: serverCreateSettings.createParams(serverName, consoleID.consoleID).nodejs,
            python: serverCreateSettings.createParams(serverName, consoleID.consoleID).python,
            aio: serverCreateSettings.createParams(serverName, consoleID.consoleID).aio,
            java: serverCreateSettings.createParams(serverName, consoleID.consoleID).java,
            ts3: serverCreateSettings.createParams(serverName, consoleID.consoleID).ts3,
            mumble: serverCreateSettings.createParams(serverName, consoleID.consoleID).mumble,
            mongodb: serverCreateSettings.createParams(serverName, consoleID.consoleID).mongodb,
            redis: serverCreateSettings.createParams(serverName, consoleID.consoleID).redis,
            postgres14: serverCreateSettings.createParams(serverName, consoleID.consoleID).postgres14,
            postgres16: serverCreateSettings.createParams(serverName, consoleID.consoleID).postgres16,
            sharex: serverCreateSettings.createParams(serverName, consoleID.consoleID).sharex,
            codeserver: serverCreateSettings.createParams(serverName, consoleID.consoleID).codeserver,
            gitea: serverCreateSettings.createParams(serverName, consoleID.consoleID).gitea,
            haste: serverCreateSettings.createParams(serverName, consoleID.consoleID).haste,
            uptimekuma: serverCreateSettings.createParams(serverName, consoleID.consoleID).uptimekuma,
            rustc: serverCreateSettings.createParams(serverName, consoleID.consoleID).rustc,
            redbot: serverCreateSettings.createParams(serverName, consoleID.consoleID).redbot,
            grafana: serverCreateSettings.createParams(serverName, consoleID.consoleID).grafana,
            openx: serverCreateSettings.createParams(serverName, consoleID.consoleID).openx,
            mariadb: serverCreateSettings.createParams(serverName, consoleID.consoleID).mariadb,
            rabbitmq: serverCreateSettings.createParams(serverName, consoleID.consoleID).rabbitmq,
            bun: serverCreateSettings.createParams(serverName, consoleID.consoleID).bun,
        };

        const consoleID = userData.get(interaction.user.id);

        if (!consoleID) {
            return interaction.reply({
                content: `Oh no, it seems you do not have an account linked to your Discord ID.\nIf you haven't made an account yet, use \`/user new\`. If you already have an account, link it using \`/user link\`.`,
                ephemeral: true
            });
        }

        if (subcommand === 'list') {
            return interaction.reply({ embeds: [helpEmbed] });
        }

        if (!type || !types.hasOwnProperty(type)) {
            return interaction.reply({ embeds: [helpEmbed] });
        }

        async function createServerAndSendResponse(type, interaction) {
            try {
                const response = await serverCreateSettings.createServer(types[type]);
                const embed = new EmbedBuilder()
                    .setColor('GREEN')
                    .addFields(
                        { name: '__**Status:**__', value: response.statusText },
                        { name: '__**Created for user ID:**__', value: consoleID.consoleID },
                        { name: '__**Server name:**__', value: serverName },
                        { name: '__**Type:**__', value: type.toUpperCase() }
                    );
                return interaction.reply({ embeds: [embed] });
            } catch (error) {
                const embed = new EmbedBuilder().setColor('RED');

                if (error.message.includes('400')) {
                    embed.addFields({
                        name: '__**Failed to create a new server**__',
                        value: 'The node is currently full. If there are no updates soon, alert an admin.'
                    });
                } else if (error.message.includes('504')) {
                    embed.addFields({
                        name: '__**Failed to create a new server**__',
                        value: 'The node is currently offline or having issues. **PLEASE RETRY**'
                    });
                } else if (error.message.includes('429')) {
                    embed.addFields({
                        name: '__**Failed to create a new server**__',
                        value: 'Uh oh, This shouldn\'t happen, Try again in a minute or two.'
                    });
                } else {
                    embed.addFields({
                        name: '__**Failed to create a new server**__',
                        value: `Some other issue happened. If this continues, please open a ticket and report this to an admin. Error: ${error.message}`
                    });
                }

                return interaction.reply({ embeds: [embed] });
            }
        }

        await createServerAndSendResponse(type, interaction);
    }
};