module.exports = {
    isGameServer: false,
    isDisabled: false,
    subCategory: "Software",
    createServer: createServer
}

function createServer(ServerName, UserID){
    return {
        name: ServerName,
        user: UserID,
        nest: 5,
        egg: 26,
        docker_image: "parkervcp/apps:uptimekuma",
        startup: "if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == \"1\" ]]; then npm run setup; fi; \/usr\/local\/bin\/node \/home\/container\/server\/server.js --port={{SERVER_PORT}}",
        limits: {
            memory: 512,
            swap: -1,
            disk: 512,
            io: 500,
            cpu: 50,
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
