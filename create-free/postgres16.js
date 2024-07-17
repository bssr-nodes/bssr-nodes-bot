createList.postgres16 = (serverName, userID) => ({
    name: serverName,
    user: userID,
    nest: 5,
    egg: 17,
    docker_image: "ghcr.io/parkervcp/yolks:postgres_16",
    startup: "postgres  -D /home/container/postgres_db/",
    limits: {
        memory: 4096,
        swap: -1,
        disk: 10384,
        io: 500,
        cpu: 100,
    },
    environment: {
        PGUSER: "bssrnodes",
        PGPASSWORD: getPassword(),
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
