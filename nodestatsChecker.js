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
                    let nodeStatusResponse = await axios({
                        url: `${config.Pterodactyl.hosturl}/api/application/nodes/${data.ID}`,
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${config.Pterodactyl.apikey}`,
                            "Content-Type": "application/json",
                            Accept: "Application/vnd.pterodactyl.v1+json"
                        }
                    });

                    const nodeStatus = nodeStatusResponse.data.attributes.under_maintenance;
                    
                    if (nodeStatus === false) {
                        console.log(`[NODE STATUS] ${node} is online according to Pterodactyl API`);
                        nodeStatus.set(`${node}.timestamp`, Date.now());
                        nodeStatus.set(`${node}.status`, true);
                        nodeStatus.set(`${node}.is_vm_online`, true);
                    } else {
                        console.log(`[NODE STATUS] ${node} is offline according to Pterodactyl API, attempting to ping the server IP...`);
                        try {
                            await ping.ping(data.IP, 22);
                            console.log(`[PING SUCCESS] ${node} is responding to ping, likely a Pterodactyl issue.`);
                            nodeStatus.set(`${node}.timestamp`, Date.now());
                            nodeStatus.set(`${node}.status`, true);
                            nodeStatus.set(`${node}.is_vm_online`, false);
                        } catch (pingError) {
                            console.error(`[PING ERROR] Failed to ping ${node}:`, pingError.message);
                            nodeStatus.set(`${node}.timestamp`, Date.now());
                            nodeStatus.set(`${node}.status`, false);
                            nodeStatus.set(`${node}.is_vm_online`, false);
                        }
                    }
                } catch (error) {
                    console.error(`[PTERODACTYL API ERROR] Error checking node status for ${node}:`, error.message);

                    try {
                        await ping.ping(data.IP, 22);
                        console.log(`[PING SUCCESS] ${node} is responding to ping, likely a Pterodactyl API issue.`);
                        nodeStatus.set(`${node}.timestamp`, Date.now());
                        nodeStatus.set(`${node}.status`, true);
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