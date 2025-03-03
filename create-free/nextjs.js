module.exports = {
    isGameServer: false,
    isDisabled: false,
    subCategory: "Languages",
    createServer: createServer
}

function createServer(ServerName, UserID){
    return {
        name: ServerName,
        user: UserID,
        nest: 5,
        egg: 22,
        docker_image: "ghcr.io/parkervcp/yolks:nodejs_20",
        startup: 'npx next dev -p {{SERVER_PORT}}',
        limits: {
            memory: 512,
            swap: -1,
            disk: 512,
            io: 500,
            cpu: 50,
        },
        environment: {
            NODE_ENV: "development",
        },
        feature_limits: {
            databases: 0,
            allocations: 0,
            backups: 0,
        },
        deploy: {
            locations: botswebdbFREE,
            dedicated_ip: false,
            port_range: [],
        },
        start_on_completion: false,
    };
};