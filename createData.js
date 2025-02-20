const axios = require("axios");
const Config = require('./config.json');
const fs = require("fs");
const path = require("path");

global.gamingFREE = [1]; // Gaming nodes
global.botswebdbFREE = [1]; // Bots, Websites and Databases nodes
global.storageFREE = [1]; // Storage nodes

let ServerTypes = {};

const createParams = (ServerName, ServerType, UserID) => {
    return ServerTypes[ServerType].createServer(ServerName, UserID);
};

// Function to enforce creation on Node 1
const createServer = async (ServerData) => {
    // Override the node selection to always use Node 1
    ServerData.deploy.locations = [1]; // Ensure the server is created on Node 1

    try {
        const response = await axios({
            url: Config.Pterodactyl.hosturl + "/api/application/servers",
            method: "POST",
            followRedirect: true,
            maxRedirects: 5,
            headers: {
                Authorization: "Bearer " + Config.Pterodactyl.apikey,
                "Content-Type": "application/json",
                Accept: "Application/vnd.pterodactyl.v1+json",
            },
            data: ServerData,
        });

        return response.data; // Return the response if successful
    } catch (error) {
        console.error("Error creating server:", error);
        return null; // Return null if an error occurs
    }
};

// Function to check and enforce creation on Node 1
const createServerOnNode1 = async (ServerData) => {
    const serverCreationResponse = await createServer(ServerData);

    if (!serverCreationResponse) {
        console.log("Retrying server creation on Node 1...");
        // Retry the server creation by calling createServer again to enforce Node 1
        return await createServer(ServerData);
    }

    return serverCreationResponse;
};

async function initialStart() {
    try {
        const files = (await fs.promises.readdir("./create-free/")).filter((f) => f.endsWith(".js"));

        for (const file of files) {
            const fullPath = path.resolve("./create-free/", file);
            delete require.cache[require.resolve(fullPath)];
            const module = require(fullPath);

            ServerTypes[file.replace(".js", "")] = module;
        }
    } catch (Error) {
        console.error("Error reading files:", Error);
    }
}

module.exports = {
    serverTypes: ServerTypes,   // Types of servers property.
    createParams: createParams, // Create server parameters with server name and user ID.
    createServer: createServerOnNode1, // Use the function that ensures creation on Node 1.
    initialStart: initialStart  // Initial start function.
};