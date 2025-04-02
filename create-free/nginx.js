module.exports = {
    isGameServer: false,
    isDisabled: false,
    subCategory: "Web Hosting",
    createServer: createServer
}

function createServer(ServerName, UserID){
    return {
        name: ServerName,
        user: UserID,
        nest: 5,
        egg: 24,
        docker_image: "danbothosting/nginx",
        startup: `{{STARTUP_CMD}}`,
        limits: {
            memory: 512,
            swap: -1,
            disk: 512,
            io: 500,
            cpu: 50,
        },
        environment: {
            STARTUP_CMD: "./start.sh",
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
    };
};
