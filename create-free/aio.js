createList.aio = (serverName, userID) => ({
    name: serverName,
    user: userID,
    nest: 5,
    egg: 15,
    docker_image: "danbothosting/aio",
    startup: "${STARTUP_CMD}",
    limits: {
        memory: 4096,
        swap: -1,
        disk: 10384,
        io: 500,
        cpu: 100,
    },
    environment: {
        STARTUP_CMD: "bash",
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
