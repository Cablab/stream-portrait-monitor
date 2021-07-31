const auth = require('./auth.js');
const discord = require('./discord.js');
const obs = require('./obs.js');

// Run bot
main();

// main is the entry point for the bot. It sets up authorization,
// client connections, and event handlers for the different integrations.
async function main() {
    // Auth tokens
    const tokens = await auth.readTokens().then((data) => {
        return data;    
    })
    .catch((err) => {
        console.log(err);
    })

    await connectOBS(tokens);
    connectDiscord(tokens.discord);
}

// connectDiscord has the bot connect to Discord and setup necessary event listeners
async function connectDiscord(tokens) {
    await discord.connect(tokens.botToken);
    discord.createEventHandlers();
}

// connectOBS has the bot connect to OBS
async function connectOBS(tokens) {
    await obs.connect(tokens.obs.webSocketPass);
    await obs.setupUsernameMap(tokens.discord.staticUsernames);
    obs.hideStatic();
}