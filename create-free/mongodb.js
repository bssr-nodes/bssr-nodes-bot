const generatePassword = require('../src/util/generatePassword.js');

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
        egg: 20,
        docker_image: "ghcr.io/parkervcp/yolks:mongodb_4",
        startup: "mongod --fork --dbpath /home/container/mongodb/ --port ${SERVER_PORT} --bind_ip 0.0.0.0 --logpath /home/container/logs/mongo.log -f /home/container/mongod.conf; until nc -z -v -w5 127.0.0.1 ${SERVER_PORT}; do echo 'Waiting for mongodb connection...'; sleep 5; done && mongo --username ${MONGO_USER} --password ${MONGO_USER_PASS} --host 127.0.0.1:${SERVER_PORT} && mongo --eval \"db.getSiblingDB('admin').shutdownServer()\" 127.0.0.1:${SERVER_PORT}",
        limits: {
            memory: 512,
            swap: -1,
            disk: 512,
            io: 500,
            cpu: 50,
        },
        environment: {
            MONGO_USER: "admin",
            MONGO_USER_PASS: generatePassword(),
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
        oom_disabled: false,
    };
};