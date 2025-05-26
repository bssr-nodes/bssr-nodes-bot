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
        egg: 19,
        docker_image: "ghcr.io/parkervcp/yolks:python_3.9",
        startup: 'echo "online"; if [[ -d .git ]] && [[ "{{AUTO_UPDATE}}" == "1" ]]; then git pull; fi; if [[ ! -z "{{PY_PACKAGES}}" ]]; then pip install -U {{PY_PACKAGES}}; fi; if [[ -f /home/container/${REQUIREMENTS_FILE} ]]; then pip install -U --prefix .local -r ${REQUIREMENTS_FILE}; fi; /usr/local/bin/python /home/container/{{PY_FILE}}',
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
            PY_FILE: "main.py",
            PY_PACKAGES: "",
            USERNAME: "",
            ACCESS_TOKEN: "",
            REQUIREMENTS_FILE: "requirements.txt",
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