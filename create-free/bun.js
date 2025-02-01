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
        egg: 18,
        docker_image: "ghcr.io/parkervcp/yolks:bun_latest",
        startup:
            'if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; if [[ ! -z ${BUN_PACKAGES} ]]; then bun install ${BUN_PACKAGES}; fi; if [[ ! -z ${RMBUN_PACKAGES} ]]; then bun remove ${RMBUN_PACKAGES}; fi; if [ -f /home/container/package.json ]; then bun install; fi; bun run {{MAIN_FILE}}',
        limits: {
            memory: 128,
            swap: -1,
            disk: 236,
            io: 500,
            cpu: 20,
        },
        environment: {
            GIT_ADDRESS: null,
            USER_UPLOAD: 0,
            AUTO_UPDATE: 0,
            MAIN_FILE: "index.js",
            BUN_PACKAGES: null,
            RMBUN_PACKAGES: null,
            BRANCH: null,
            USERNAME: null,
            ACCESS_TOKEN: null,
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