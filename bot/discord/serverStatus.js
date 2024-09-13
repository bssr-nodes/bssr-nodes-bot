const { EmbedBuilder } = require('discord.js');
const axios = require("axios");
const ping = require("ping-tcp-js");

const nstatus = {
    "Public Nodes": [
        {
            name: "Car",
            data: "car",
            maxCount: 100,
        },
    ],
};

const nodeStatus = new Map(); // Mock for demonstration
const nodeServers = new Map(); // Mock for demonstration
const nodePing = new Map(); // Mock for demonstration

const parse = async () => {
    let toReturn = {};
    for (let [title, data] of Object.entries(nstatus)) {
        let temp = [];
        for (let d of data) {
            let timeoutReached = false;
            let timer = setTimeout(() => {
                timeoutReached = true;
                temp.push(`${d.name}: ❓ No data found`);
            }, 3000);

            try {
                // Fetching node status
                let da = await nodeStatus.get(d.data.toLowerCase());
                let nodeData = await nodeServers.get(d.name.toLowerCase());
                let pingResult = await nodePing.fetch(d.name.toLowerCase());

                clearTimeout(timer);
                if (timeoutReached) continue;

                if (!da) {
                    temp.push(`${d.name}: ❓ No data found`);
                    continue;
                }

                let serverUsage = nodeData?.servers !== undefined ? `${nodeData.servers} / ${d.maxCount}` : "N/A";

                let statusText = "";
                if (da.maintenance) {
                    statusText = "<a:maintenance:1265630967872229408> Maintenance ~ Returning Soon!";
                } else if (da.status) {
                    statusText = `🟢 Online (${serverUsage})`;
                } else if (da.is_vm_online == null) {
                    // If node status is null, check the Wings daemon status
                    console.log(`[NODE STATUS] ${d.name} is offline according to Pterodactyl API, attempting to ping the server IP...`);
                    try {
                        await ping.ping(config.Nodes[d.data], 8443); // Ping the Wings daemon on port 8443
                        statusText = `${da.is_vm_online ? "<a:loading:1265631230540513363> **Wings**" : "<:error:1265632865215971390> **System**"} **online** ${serverUsage}`;
                    } catch (pingError) {
                        console.error(`[PING ERROR] ${d.name} Wings daemon is not responding to ping:`, pingError.message);
                        statusText = "<:error:1265632865215971390> **System** **offline**";
                    }
                } else {
                    statusText = `${da.is_vm_online ? "<a:loading:1265631230540513363> **Wings**" : "<:error:1265632865215971390> **System**"} **offline** ${serverUsage}`;
                }

                temp.push(`${d.name}: ${statusText}`);
            } catch (error) {
                clearTimeout(timer);
                temp.push(`${d.name}: ❓ Error retrieving data`);
                console.error(`[STATUS ERROR] Error fetching status for ${d.name}:`, error.message);
            }
        }
        toReturn[title] = temp;
    }
    return toReturn;
};

const getEmbed = async () => {
    try {
        let status = await parse();
        let desc = Object.entries(status)
            .map(([title, d]) => `***${title}***\n${d.join("\n")}`)
            .join("\n\n");

        if (!desc.trim()) {
            desc = 'No status information available.';
        }

        return new EmbedBuilder()
            .setTitle("BSSR Nodes Status")
            .setDescription(desc)
            .setTimestamp();
    } catch (error) {
        console.error("Error fetching or sending embed:", error);

        return new EmbedBuilder()
            .setTitle('Error')
            .setDescription('An error occurred while fetching server status.')
            .setColor('#FF0000')
            .setTimestamp();
    }
};

const sendStatusEmbed = async (channel) => {
    const embed = await getEmbed();
    channel.send({ embeds: [embed] });
};

module.exports = {
    parse: parse,
    getEmbed: getEmbed,
};
