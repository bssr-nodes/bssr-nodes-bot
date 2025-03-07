const generatePassword = require('../src/util/generatePassword.js');

module.exports = {
    isGameServer: false,
    isDisabled: false,
    subCategory: "Databases",
    createServer: createServer
}

function createServer(ServerName, UserID){
    return {
        name: ServerName,
        user: UserID,
        nest: 5,
        egg: 25,
        docker_image: "ghcr.io/parkervcp/yolks:postgres_16",
        startup: `postgres  -D /home/container/postgres_db/`,
        limits: {
            memory: 512,
            swap: -1,
            disk: 512,
            io: 500,
            cpu: 50,
        },
        environment: {
            PGPASSWORD: generatePassword(),
            PGUSER: "pterodactyl",
        },
        feature_limits: {
            databases: 0,
            allocations: 1,
            backups: 0,
        },
        deploy: {
            locations: botswebdbFREE,
            dedicated_ip: false,
            port_range: [],
        },
        start_on_completion: false,
        oom_disabled: false,
    };
};
