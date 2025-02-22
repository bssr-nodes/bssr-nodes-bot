const Discord = require("discord.js");
const Axios = require("axios");

/**
 *
 * Renews the SSL certificate for a specific domain.
 *
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @returns 
 */

exports.run = async (client, message) => {
    const data = await userData.get(message.author.id);
    if (!data) return await message.reply("You do not have an account.");

    const args = message.content.split(" ").slice(2);
    if (!args.length) return await message.reply("Please specify a domain to renew, and don't add `https://` to it. CORRECT: `example.bssr-nodes.com` WRONG: `https://example.bssr-nodes.com`");

    const domain = data.domains.find(dom => dom.domain === args[0]);
    if (!domain) return await message.reply("The specified domain is not linked to your account.");

    await message.reply("Renewing SSL certificate for your domain... this can take up to 30 seconds.");

    const token = await getToken(
        Config.Proxy1.apiUrl,
        Config.Proxy1.email,
        Config.Proxy1.password
    );

    try {
        const res = await Axios({
            url: `${Config.Proxy1.url}/api/nginx/certificates/${domain.proxyID}/renew`,
            method: "POST",
            headers: {
                Authorization: token,
                "Content-Type": "application/json"
            }
        });

        if (res.data.error) {
            await message.reply(`Failed to renew SSL for ${domain.domain}: ${res.data.error}`);
        } else {
            await message.reply(`✅ SSL certificate successfully renewed for ${domain.domain}`);
        }
    } catch (err) {
        await message.reply(`Error during SSL renewal for ${domain.domain}: ${err.response?.data || err.message}`);
    }
};

async function getToken(Url, Email, Password) {
    const serverRes = await Axios({
        url: Url + "/api/tokens",
        method: "POST",
        followRedirect: true,
        maxRedirects: 5,
        headers: {
            "Content-Type": "application/json",
        },
        data: {
            identity: Email,
            secret: Password,
        },
    });

    const token = "Bearer " + serverRes.data.token;

    return token;
}

exports.description = "Renews the SSL certificate for a specific domain.";