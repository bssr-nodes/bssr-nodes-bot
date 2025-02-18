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
        egg: 21,
        docker_image: "ghcr.io/parkervcp/yolks:dotnet_8",
        startup: 'echo "online"; if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; cd {{PROJECT_DIR}}; dotnet restore; dotnet run --project {{PROJECT_FILE}}',
        limits: {
            memory: 512,
            swap: -1,
            disk: 512,
            io: 500,
            cpu: 50,
        },
        environment: {
            GIT_ADDRESS: "",
            BRANCH: "",
            USER_UPLOAD: "0",
            AUTO_UPDATE: "0",
            USERNAME: "",
            ACCESS_TOKEN: "",
            PROJECT_FILE: "",
            PROJECT_DIR: "/home/container",
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