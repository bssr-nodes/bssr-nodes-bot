/*
    ____              ____        __     __  __           __  _
   / __ \____ _____  / __ )____  / /_   / / / /___  _____/ /_(_)___  ____ _
  / / / / __ `/ __ \/ __  / __ \/ __/  / /_/ / __ \/ ___/ __/ / __ \/ __ `/
 / /_/ / /_/ / / / / /_/ / /_/ / /_   / __  / /_/ (__  ) /_/ / / / / /_/ /
/_____/\__,_/_/ /_/_____/\____/\__/  /_/ /_/\____/____/\__/_/_/ /_/\__, /
Free Hosting forever!                                            /____/
*/
const axios = require("axios");

global.gamingFREE = [1, 2]; // Gaming nodes
global.botswebdbFREE = [1, 2]; // Bots, Websites and Databases nodes
global.storageFREE = [1, 2]; // Storage nodes

/*
Byte  : 1
Pixel : 2
*/

let data = (serverName, userID) => {
    let toReturn = {
        nodejs: 19,
        python: 20,
        aio: 15,
        bun: 21,
        postgres16: 17,
        mongodb: 23,
        redis: 24,
        uptimekuma: 25,

    };

    for (let [name, filled] of Object.entries(createList)) {
        toReturn[name] = filled(serverName, userID);
    }
    return toReturn;
};

let createServer = (data) => {
    return axios({
        url: config.Pterodactyl.hosturl + "/api/application/servers",
        method: "POST",
        followRedirect: true,
        maxRedirects: 5,
        headers: {
            Authorization: "Bearer " + config.Pterodactyl.apikey,
            "Content-Type": "application/json",
            Accept: "Application/vnd.pterodactyl.v1+json",
        },
        data: data,
    });
};

module.exports = {
    createParams: data,
    createServer: createServer,
};
