const Config = require('../config.json');

const Status = {
        Nodes: {
            "Nodes": {
                pnode1: {
                    Name: "Car",
                    serverID: "d92a4b20",
                    IP: Config.Nodes.PNode1,
                    ID: "1",
                    Location: Config.Ping.CA,
                    MaxLimit: 8000
                },
            }
        },

        "BSSR Services": {
            pterodactylPublic: {
                name: "Pterodactyl (Public)",
                IP: Config.Services.pteropublic,
                Location: Config.Ping.CA
            }
        }
}

module.exports = Status;
