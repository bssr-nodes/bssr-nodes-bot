const axios = require("axios");
const ping = require("ping-tcp-js");
const chalk = require("chalk");

let stats = {
    car: {
        serverID: "73284280",
        IP: config.Nodes.Car,
        ID: "1",
        wingsPort: 8443
    }
};

if (config.Enabled.nodestatsChecker) {
    console.log(chalk.magenta("[NODE CHECKER] ") + chalk.green("Enabled"));

    setInterval(() => {
        for (let [node, data] of Object.entries(stats)) {
            setTimeout(async () => {
                let wingsStatus = "Unknown";
                let systemStatus = "Unknown";

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

                    wingsStatus = "Online";
                    console.log(`[NODE STATUS] ${node} Wings is online`);
                } catch (error) {
                    console.error(`[PTERODACTYL ERROR] Error checking Wings status for ${node}:`, error.message);
                    wingsStatus = "Offline";

                    console.log(`[NODE STATUS] ${node} is offline according to Pterodactyl API, attempting to ping the Wings daemon...`);
                    try {
                        await ping.ping(data.IP, data.wingsPort);
                        systemStatus = "Online";
                        console.log(`[PING SUCCESS] ${node} Wings daemon is online`);
                    } catch (pingError) {
                        console.error(`[PING ERROR] ${node} Wings daemon is not responding to ping:`, pingError.message);
                        systemStatus = "Offline";
                    }
                }

                if (wingsStatus === "Offline" && systemStatus === "Online") {
                    console.log(`[STATUS] ${node}: Wings Offline, System Online`);
                } else if (systemStatus === "Offline") {
                    console.log(`[STATUS] ${node}: System Offline`);
                }
            }, 2000);
        }
    }, 10000);
} else {
    console.log(chalk.magenta("[NODE CHECKER] ") + chalk.red("Disabled"));
}
