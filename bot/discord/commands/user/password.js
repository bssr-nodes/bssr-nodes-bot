const axios = require('axios');

module.exports = {
    async execute(interaction) {
        const CAPSNUM = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
        const getPassword = () => {
            let password = '';
            while (password.length < 10) {
                password += CAPSNUM[Math.floor(Math.random() * CAPSNUM.length)];
            }
            return password;
        };

        let password = getPassword();

        try {
            const response = await axios({
                url: `${config.Pterodactyl.hosturl}/api/application/users/${userData.get(interaction.user.id).consoleID}`,
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${config.Pterodactyl.apikey}`,
                    'Content-Type': 'application/json',
                    Accept: 'Application/vnd.pterodactyl.v1+json',
                },
            });

            const fetchData = response.data.attributes;

            const data = {
                email: fetchData.email,
                username: fetchData.username,
                first_name: fetchData.first_name,
                last_name: fetchData.last_name,
                password: password,
            };

            await axios({
                url: `${config.Pterodactyl.hosturl}/api/application/users/${userData.get(interaction.user.id).consoleID}`,
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${config.Pterodactyl.apikey}`,
                    'Content-Type': 'application/json',
                    Accept: 'Application/vnd.pterodactyl.v1+json',
                },
                data: data,
            });

            await interaction.reply({
                content: "Your console account password has been reset. Please check your DMs for the new password. An email will also be sent with the new password.",
                ephemeral: true,
            });

            await interaction.user.send(`New password for BSSR Nodes: ||**${data.password}**||`);

            const emailmessage = {
                from: config.Email.From,
                to: data.email,
                subject: 'BSSR Nodes - Password reset via bot',
                html: `Hello, the console account password for email: ${userData.get(interaction.user.id).email} was just reset. Here is the new password: ${data.password}`,
            };
            transport.sendMail(emailmessage);

        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: 'There was an error resetting your password. Please try again later.',
                ephemeral: true,
            });
        }
    },
};