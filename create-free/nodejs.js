createList.nodejs = (serverName, userID) => ({
    name: serverName,
    user: userID,
    nest: 5,
    egg: 19,
    docker_image: "ghcr.io/parkervcp/yolks:nodejs_18",
    startup: `/usr/local/bin/npm i && /usr/local/bin/node /home/container/{{BOT_JS_FILE}}`,
    limits: {
        memory: 2048,
        swap: -1,
        disk: 4096,
        io: 500,
        cpu: 100,
    },
    environment: {
        BOT_JS_FILE: "index.js",
    },
    feature_limits: {
        databases: 0,
        allocations: 1,
        backups: 5,
    },
    deploy: {
        locations: botswebdbFREE,
        dedicated_ip: false,
        port_range: [],
    },
    start_on_completion: false,
});
