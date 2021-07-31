const fs = require('fs');

// Global Constants
const TOKENS_PATH = './secrets.json';
const ENCODING = 'utf8'

// readTokens read a local JSON file that contains auth tokens and other
// secrets, parses the JSON, and returns it as an object
var readTokens = function() {
    return new Promise((resolve, reject) => {
        const data = fs.readFileSync(TOKENS_PATH, ENCODING);
        const tokens = JSON.parse(data);
        resolve(tokens);
    }, () => {
        reject('error: failed to read tokens file');
    });
}

// Make available to other files
module.exports = {
    readTokens
};