const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const validator = require('validator');
const moment = require('moment');

module.exports = {
    async execute(interaction) {
        const username = interaction.options.getString('username').toLowerCase();
        const email = interaction.options.getString('email').toLowerCase();

        if (userData.get(interaction.user.id)) {
            await interaction.reply({ content: "You already have a `panel account` linked to your Discord account.", ephemeral: true });
            return;
        }

        if (username.includes(" ") || /[^a-zA-Z0-9]/.test(username)) {
            await interaction.reply({ content: "Username must not contain spaces or special characters.", ephemeral: true });
            return;
        }

        if (!validator.isEmail(email)) {
            await interaction.reply({ content: "Please provide a valid email address.", ephemeral: true });
            return;
        }

        const password = generatePassword();

        const accountData = {
            username,
            email,
            first_name: username,
            last_name: ".",
            password,
            root_admin: false,
            language: "en",
        };

        try {
            const response = await axios.post(
                `${config.Pterodactyl.hosturl}/api/application/users`,
                accountData,
                {
                    headers: {
                        Authorization: `Bearer ${config.Pterodactyl.apikey}`,
                        'Content-Type': 'application/json',
                    }
                }
            );

            userData.set(interaction.user.id, {
                discordID: interaction.user.id,
                consoleID: response.data.attributes.id,
                email: response.data.attributes.email,
                username: response.data.attributes.username,
                linkTime: moment().format('HH:mm:ss'),
                linkDate: moment().format('YYYY-MM-DD'),
                domains: [],
            });

            const userEmbed = new EmbedBuilder()
                .setColor('Green')
                .setTitle('Account Created')
                .setDescription('Here is your account information:')
                .addFields(
                    { name: 'Username', value: username, inline: true },
                    { name: 'Email', value: email, inline: true },
                    { name: 'Password', value: password, inline: true },
                    { name: 'URL', value: config.Pterodactyl.hosturl }
                )
                .setFooter({ text: 'Please change your password after logging in.' });

            await interaction.reply({ embeds: [userEmbed], ephemeral: true });

            const logEmbed = new EmbedBuilder()
                .setColor('Blue')
                .setTitle('New Account Created')
                .addFields(
                    { name: 'Discord Account', value: `<@${interaction.user.id}> (${interaction.user.id})`, inline: true },
                    { name: 'Console Account Email', value: response.data.attributes.email, inline: true },
                    { name: 'Created At', value: `${moment().format('HH:mm:ss')} / ${moment().format('YYYY-MM-DD')}`, inline: true },
                    { name: 'Console Username', value: response.data.attributes.username, inline: true },
                    { name: 'Console ID', value: response.data.attributes.id.toString(), inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'Account created successfully.' });

            const logChannel = interaction.client.channels.cache.get('1250044501180026881');
            if (logChannel) {
                await logChannel.send({ embeds: [logEmbed] });
            } else {
                console.error('Log channel not found');
            }

        } catch (error) {
            console.error('Error creating account:', error);
            await interaction.reply({
                content: `There was an error creating your account. Please try again later.`,
                ephemeral: true,
            });
        }
    }
};

function generatePassword() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    let password = '';
    for (let i = 0; i < 10; i++) {
        password += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return password;
}