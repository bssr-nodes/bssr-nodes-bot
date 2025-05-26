const Config = require('../config.json');

const Proxies = [
    {
        name: "Proxy 1",                    //The name to be displayed on embeds.
        dbLocation: "P1",                   //The location within the database.
        url: Config.Proxy1.url,             //The URL for requests.
        ip: "46.247.108.162",               //The IP for the proxy.
        email: Config.Proxy1.email,         //The email for the Administrator Account.
        pass: Config.Proxy1.pass,           //The password for the Administrator Account.
        premiumOnly: false,                 //If the proxy is only available to premium users.
    },
]

module.exports = { Proxies };