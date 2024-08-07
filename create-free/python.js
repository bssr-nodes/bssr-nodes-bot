createList.python = (serverName, userID) => ({
    name: serverName,
    user: userID,
    nest: 5,
    egg: 20,
    docker_image: "ghcr.io/parkervcp/yolks:python_3.9",
    startup:
        'if [[ ! -z "{{PY_PACKAGES}}" ]]; then pip install -U --prefix .local {{PY_PACKAGES}}; fi; if [[ -f /home/container/${REQUIREMENTS_FILE} ]]; then pip install -U --prefix .local -r ${REQUIREMENTS_FILE}; fi; ${STARTUP_CMD}',
    limits: {
        memory: 2048,
        swap: -1,
        disk: 4096,
        io: 500,
        cpu: 100,
    },
    environment: {
        REQUIREMENTS_FILE: "requirements.txt",
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
