const Discord = require('discord.js');
const Axios = require('axios');

const Config = require('../../../config.json');
const Proxies = require('../../../config/proxy-configs.js').Proxies;

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

    return "Bearer " + serverRes.data.token;
}

async function deleteCertificate(Url, Token, CertificateId){

    return await Axios({
        url:
            Url +
            "/api/nginx/certificates/" +
            CertificateId,
        method: "DELETE",
        followRedirect: true,
        maxRedirects: 5,
        headers: {
            Authorization: Token,
            "Content-Type": "application/json",
        },
    });
}

async function deleteProxy(Url, Token, Domain, ProxiesResponse){
    return await Axios({
        url: Url +
            "/api/nginx/proxy-hosts/" +
            ProxiesResponse.data.find(
                (element) =>
                    element.domain_names[0] == Domain,
            ).id,
        method: "DELETE",
        followRedirect: true,
        maxRedirects: 5,
        headers: {
            Authorization: Token,
            "Content-Type": "application/json",
        },
    })
}

async function getAllCertificates(Url, Token){
    return await Axios({
        url: Url + "/api/nginx/certificates",
        method: "GET",
        followRedirect: true,
        maxRedirects: 5,
        headers: {
            Authorization: Token,
            "Content-Type": "application/json",
        },
    });
}

async function deleteDomainDB(UserId, Domain){
    const userAccount = await userData.get(UserId);
    
    await userData.set(
        UserId + ".domains",
        userAccount.domains.filter((x) => x.domain != Domain)
    );

    return true;
}

exports.description = "Unproxies a domain from a server.";

/**
 * 
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {Array} args 
 * @returns void
 */
exports.run = async (client, message, args) => {

    const UnproxyEmbed = new Discord.EmbedBuilder();
    UnproxyEmbed.setTitle("**Unproxying Domain from BSSR Nodes server:**");
    UnproxyEmbed.setColor('Blue')
    UnproxyEmbed.setDescription(
        "\n\nSyntax for Command: ```" +
            Config.DiscordBot.Prefix +
            "server unproxy <DOMAIN>```\n" + 
            "- Replace `<DOMAIN>` with your domain. E.g. `example.bssr-nodes.com`\n" + 
            "- You can find a list with all your proxied domains with: `" +
            Config.DiscordBot.Prefix +
            "user domains`",
    );
    UnproxyEmbed.setTimestamp();
    UnproxyEmbed.setFooter({ text: client.user.displayName, icon: client.user.displayAvatarURL() });

    if(!args[1]) return await message.reply({embeds: [UnproxyEmbed]});

    const userDomains = await userData.get(message.author.id + ".domains");

    if (userDomains.find((x) => x.domain === args[1].toLowerCase()) == null) {
        message.reply(
            "I could not find this domain! Please make sure you have entered a valid domain. A valid domain is `bssr-nodes.com`, `https://bssr-nodes.com/` is not valid domain!",
        );
        return;
    }

    const domainData = await userDomains.find((x) => x.domain === args[1].toLowerCase());

    if (Proxies.map(x => x.dbLocation).includes(domainData.location)) {

        const ProxyInformation = Proxies.find(x => x.dbLocation == domainData.location);

        const ProxyToken = await getToken(ProxyInformation.url, ProxyInformation.email, ProxyInformation.pass);

        await Axios({
            url: ProxyInformation.url + "/api/nginx/proxy-hosts",
            method: "GET",
            followRedirect: true,
            maxRedirects: 5,
            headers: {
                Authorization: ProxyToken,
                "Content-Type": "application/json",
            }        
        }).then(async (ProxiesResponse) => {

            const ProxyFound = ProxiesResponse.data.find(Proxies => Proxies.domain_names[0] == domainData.domain);

            const AllCertificates = await getAllCertificates(ProxyInformation.url, ProxyToken);
            const CertificateFound = AllCertificates.data.find((element) => element.domain_names[0] == domainData.domain);

            const ProxyMessage = await message.channel.send('[PROXY SYSTEM] Attempting to unproxy the domain.');

            if (CertificateFound == undefined) {
                await ProxyMessage.edit(ProxyMessage.content + '\n[PROXY SYSTEM] Could not find the certificate for the domain. Skipping deletion of certificate.');
            } else {
                await ProxyMessage.edit(ProxyMessage.content + '\n[PROXY SYSTEM] Found the certificate for the domain. Attempting to delete it.');

                await deleteCertificate(ProxyInformation.url, ProxyToken, CertificateFound.id).then(async (Response) => {
                    await ProxyMessage.edit(ProxyMessage.content + '\n[PROXY SYSTEM] Successfully removed the certificate for the domain.');
                });
            }

            if (ProxyFound == undefined) {
                await ProxyMessage.edit(ProxyMessage.content + '\n[PROXY SYSTEM] Could not find the domain in the proxy list. Removing it from user database.');

                await deleteDomainDB(message.author.id, domainData.domain).then(async (Response) => {
                    await ProxyMessage.edit(ProxyMessage.content + '\n[PROXY SYSTEM] Successfully removed the domain from the user database.');
                });
            } else {
                await ProxyMessage.edit(ProxyMessage.content + '\n[PROXY SYSTEM] Found the domain in the proxy list. Attempting to delete from proxy list.');

                await deleteProxy(ProxyInformation.url, ProxyToken, domainData.domain, ProxiesResponse).then(async (Response) => {
                    await ProxyMessage.edit(ProxyMessage.content + '\n[PROXY SYSTEM] Successfully removed the domain from the proxy list.');

                    await deleteDomainDB(message.author.id, domainData.domain).then(async (Response) => {
                        await ProxyMessage.edit(ProxyMessage.content + '\n\n[PROXY SYSTEM] ✅ Successfully removed the domain from the user database.');
                    });
                });
            }
        }).catch(async (Error) => {
            console.error("[PROXY SYSTEM ERROR]: " + Error);
            await message.reply("[PROXY SYSTEM] An error occurred while trying to unproxy the domain. Please try again later.");
        });
    
    } else if (domainData.Location == undefined || domainData.Location == "FR" || domainData.Location == "US") {
        const ProxyMessage = await message.channel.send("[PROXY SYSTEM] This domain is from an old proxy system. Removing from your database.");
        
        await deleteDomainDB(message.author.id, domainData.domain).then(async (Response) => {
            await ProxyMessage.edit(ProxyMessage.content + '\n\n[PROXY SYSTEM] ✅ Successfully removed the domain from the user database.');
        });
    }
};
