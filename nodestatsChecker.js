const axios = require("axios");
const ping = require("ping-tcp-js");
const chalk = require("chalk");

let pingLocals = {
    EU: config.Ping.EU,
};

let stats = {
    car: {
        serverID: "73284280",
        IP: config.Nodes.car,
        ID: "1",
        Location: pingLocals.EU,
    }
};

if (config.Enabled.nodestatsChecker) {
    console.log(chalk.magenta("[NODE CHECKER] ") + chalk.green("Enabled"));

    setInterval(() => {
        for (let [node, data] of Object.entries(stats)) {
            setTimeout(async () => {
                try {
                    let pingResponse = await axios({
                        url: `http://${data.Location}?ip=${data.IP}&port=22`,
                        method: "POST",
                        headers: { "Content-Type": "application/json" }
                    });

                    let pingData = pingResponse.data?.ping || "0";
                    nodePing.set(node, { ip: pingResponse.data.address, ping: pingData });
                } catch (error) {
                    console.error(`[PING ERROR] Failed to ping ${node}:`, error.message);
                }

                try {
                    let pterodactylResponse = await axios({
                        url: `${config.Pterodactyl.hosturl}/api/client/servers/${data.serverID}/resources`,
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${config.Pterodactyl.apikeyclient}`,
                            "Content-Type": "application/json",
                            Accept: "Application/vnd.pterodactyl.v1+json"
                        }
                    });

                    nodeStatus.set(`${node}.timestamp`, Date.now());
                    nodeStatus.set(`${node}.status`, true);
                    nodeStatus.set(`${node}.is_vm_online`, true);
                } catch (error) {
                    console.error(`[PTERODACTYL ERROR] Error fetching resources for ${node}:`, error.message);

                    try {
                        await ping.ping(data.IP, 22);
                        nodeStatus.set(`${node}.timestamp`, Date.now());
                        nodeStatus.set(`${node}.status`, false);
                        nodeStatus.set(`${node}.is_vm_online`, true);
                    } catch (pingError) {
                        console.error(`[PING FALLBACK ERROR] Failed to ping ${node}:`, pingError.message);
                        nodeStatus.set(`${node}.timestamp`, Date.now());
                        nodeStatus.set(`${node}.status`, false);
                        nodeStatus.set(`${node}.is_vm_online`, false);
                    }
                }

                setTimeout(async () => {
                    try {
                        let allocationResponse = await axios({
                            url: `${config.Pterodactyl.hosturl}/api/application/nodes/${data.ID}/allocations?per_page=9000`,
                            method: "GET",
                            headers: {
                                Authorization: `Bearer ${config.Pterodactyl.apikey}`,
                                "Content-Type": "application/json",
                                Accept: "Application/vnd.pterodactyl.v1+json"
                            }
                        });

                        const serverCount = allocationResponse.data.data.filter(m => m.attributes.assigned === true).length;
                        nodeServers.set(node, { servers: serverCount });
                    } catch (error) {
                        console.error(`[ALLOCATION ERROR] Error fetching server allocation for ${node}:`, error.message);
                    }
                }, 2000);
            }, 2000);
        }
    }, 10000);
} else {
    console.log(chalk.magenta("[NODE CHECKER] ") + chalk.red("Disabled"));
}