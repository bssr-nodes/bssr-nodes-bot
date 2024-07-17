const Discord = require("discord.js");
const axios = require("axios");

// Assuming config is globally defined
const { hosturl, apikey } = config.Pterodactyl;

exports.run = async (client, message, args) => {
    const requiredRoleID = "1250223988073037906";

    if (!message.member.roles.cache.has(requiredRoleID)) {
        return message.reply("You don't have permission to use this command.");
    }

    let userID;

    if (message.mentions.users.first()) {
        userID = message.mentions.users.first().id;
    } else if (args[0] && args[0].match(/[0-9]{17,19}/)) {
        userID = args[0].match(/[0-9]{17,19}/)[0];
    } else {
        return message.reply("Please provide a valid Discord user ID or mention a user.");
    }

    const userAccount = userData.get(userID);
    if (!userAccount) {
        return message.reply("That account is not linked with a console account.");
    }

    const consoleID = userAccount.consoleID;
    if (!consoleID) {
        return message.reply("Unable to find the console ID for the provided user.");
    }

    try {
        const userResponse = await axios({
            method: 'get',
            url: `${hosturl}/api/application/users/${consoleID}`,
            headers: {
                'Authorization': `Bearer ${apikey}`,
                'Accept': 'Application/vnd.pterodactyl.v1+json'
            }
        });

        if (userResponse.status !== 200) {
            return message.reply("Failed to fetch user details from the Pterodactyl panel.");
        }

        const userData = userResponse.data.attributes;

        const updateResponse = await axios({
            method: 'patch',
            url: `${hosturl}/api/application/users/${consoleID}`,
            headers: {
                'Authorization': `Bearer ${apikey}`,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json'
            },
            data: {
                username: userData.username,
                email: userData.email,
                first_name: userData.first_name,
                last_name: userData.last_name,
                root_admin: true
            }
        });

        if (updateResponse.status === 200) {
            message.reply(`Successfully granted admin access to the user with Discord ID: ${userID}.`);
        } else {
            message.reply("Failed to grant admin access. Please check the Pterodactyl panel settings.");
        }
    } catch (error) {
        if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
            console.error("Response headers:", error.response.headers);
            message.reply(`An error occurred: ${error.response.data.errors[0].detail}`);
        } else if (error.request) {
            console.error("Request data:", error.request);
            message.reply("No response received from the Pterodactyl panel. Please try again later.");
        } else {
            console.error("Error message:", error.message);
            message.reply("An error occurred while trying to grant admin access. Please try again later.");
        }
    }
};