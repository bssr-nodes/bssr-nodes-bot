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
        egg: 16,
        docker_image: "ghcr.io/parkervcp/yolks:mariadb_10.3",
        startup: `{ /usr/sbin/mysqld & } && sleep 5 && mysql -u root`,
        limits: {
            memory: 128,
            swap: -1,
            disk: 256,
            io: 500,
            cpu: 20,
        },
        environment: {},
        feature_limits: {
            databases: 2,
            allocations: 1,
            backups: 10,
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