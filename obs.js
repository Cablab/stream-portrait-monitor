const OBSWebSocket = require('obs-websocket-js');
const obs = new OBSWebSocket();

const LOCAL_PORT_OBS = 'localhost:4444'
const STATIC_SCENE = '[NS] Static'

// Maps a static member's Discord username to the name of the image source
// in the OBS portrait scene
const discordUserToSource = new Map();

// connect has the bot connect to locally running OBS with WebSockets plugin and
// authentication enabled
var connect = function(webSocketPass) {
    return obs.connect({
        address: LOCAL_PORT_OBS,
        password: webSocketPass
    })
    .then(() => {
        console.log('Connected to OBS');
    })
    .catch((err) => {
        console.log(`error: failed to connect to OBS - ${err}`);
    })
}

// createEventHandlers sets up handlers that will respond when certain events
// are detected in the locally running OBS program the bot connected to
var createEventHandlers = function() {

}

// hideStatic loops through every member of the static and makes sure their
// portrait is hidden on load
var hideStatic = function() {
    for (let source of discordUserToSource.keys()) {
        setStaticMemberVisibility(source, false);
    }
}

// printSceneList prints the names of all available scenens from the connected
// OBS program
var printSceneList = function() {
    obs.send('GetSceneList')
    .then(data => {
        data.scenes.forEach(scene => {
            console.log(scene.name);
        })
    })
    .catch(err => {
        console.log(err);
    })
}

// setSourceVisibility sets the visbility of a source within a specified scene
var setSourceVisibility = function(sceneName, sourceName, visible) {
    return obs.send('SetSceneItemProperties', {
        'scene-name': sceneName,
        item: sourceName,
        visible: visible
    })
    .catch(err => {
        console.log(err);
    })
}

// setStaticMemberVisibility sets the visibliity of a given static member's
// portrait
var setStaticMemberVisibility = function(username, visible) {
    return obs.send('SetSceneItemProperties', {
        'scene-name': STATIC_SCENE,
        item: discordUserToSource.get(username),
        visible: visible
    })
    .catch(err => {
        console.log(err);
    })
}

// setupUsernameMap adds information to a Map so the bot can quickly look up
// the source name for a static member's picture in OBS based on their Discord
// username
var setupUsernameMap = async function(usernames) {
    Object.keys(usernames).forEach(function(username) {
        discordUserToSource.set(username, usernames[username]);
    });
}

module.exports = {
    connect,
    createEventHandlers,
    printSceneList,
    hideStatic,
    setSourceVisibility,
    setStaticMemberVisibility,
    setupUsernameMap
}