/**
 * Generates a random 16 character password.
 * 
 * @returns {String}
 */
const crypto = require('crypto');

module.exports = function () {
    const CAPSNUM = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    let password = "";

    for (let i = 0; i < 16; i++) {
        const randomIndex = crypto.randomBytes(1)[0] % CAPSNUM.length;
        password += CAPSNUM[randomIndex];
    }

    return password;
};