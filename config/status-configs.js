const Config = require('../config.json');

const Status = {
        Nodes: {
            "Nodes": {
                car: {
                    Name: "Car",
                    serverID: "d92a4b20",
                    IP: Config.Nodes.Car,
                    ID: "1",
                    Location: Config.Ping.CA,
                    MaxLimit: 100
                },
                private: {
                    Name: "Private",
                    serverID: "53b26591",
                    IP: Config.Nodes.Private,
                    ID: "2",
                    Location: Config.Ping.EU,
                    MaxLimit: 20
                },
            },
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
