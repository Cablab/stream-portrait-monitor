const DiscordJS = require('discord.js');
const discord = new DiscordJS.Client();
const obs = require('./obs.js');

// Map that holds information about the Voice Channel the bot
// has joined
const channelInfo = new Map();

// connect has the bot connect to the Discord server
var connect = function(botToken) {
    return discord.login(botToken)
    .then(() => {
        console.log('Connected to Discord');
    })
    .catch((err) => {
        console.log(`error: failed to connect to Discord - ${err}`);
    })
}

// createEventHandlers sets up handlers that will respond when
// certain events are detected in the Discord server where the
// bot is connected
var createEventHandlers = function() {
    onReady();
    onMessage();
}

// onReady sends a console message letting the user know the bot is 
// connected to the Discord server and ready to respond to events when
// it detects that it is ready to do so.
function onReady() {
    discord.once('ready', () => {
        console.log('Ready to respond to events!');
    });
}

// onMessage sets up an even that responds to messages in the Discord server 
function onMessage() {
    discord.on('message', async msg => {
        const guildID = msg.guild.id;
        if (msg.content === "!ping") {
            msg.channel.send('Pong!');
        }
        else if (msg.content === '!join') {
            if (!msg.member.voice.channelID) {
                msg.reply('Please join a voice channel first.');
            }
            else {
                if (!channelInfo.has(guildID)) {
                    await connectToVoice(msg);
                } else {
                    msg.reply('Already joined');
                }
            }
        }
    });
}

// connectToVoice takes a message received from a user in a text channel, has the bot join the same
// voice channel as the user who requested the bot, and stores information about what voice channel
// the bot joined within the server. After connection, it sets up event listeners for when it 
// disconnects from the voice channel and for when it detects any User in the voice channel changing
// their Voice State (speaking or not speaking).
async function connectToVoice(msg, guildKey) {
    try {
        let voiceChannel = await discord.channels.fetch(msg.member.voice.channelID);
        let textChannel = await discord.channels.fetch(msg.channel.id);
        let vc = await voiceChannel.join();

        channelInfo.set(guildKey, {
            'textChannel': textChannel,
            'voiceChannel': voiceChannel,
            'voiceConnection': vc
        });

        detectSpeaker(vc, guildKey);

        vc.on('disconnect', async(e) => {
            if (e) console.log(e);
            channelInfo.delete(guildKey);
            console.log("Left voice channel");
            vc.off('speaking', () => {});
        })
    }
    catch (e) {
        console.log('connect: ' + e)
        msg.reply('Error: unable to join your voice channel.');
        throw e;
    }
}

// https://discord.js.org/#/docs/main/stable/class/VoiceConnection
// detectSpeaker starts an event listener that detects when any User in a voice chat channel
// starts or stops speaking.
function detectSpeaker(voiceConnection) {
    voiceConnection.on('speaking', async (user, speaking) => {
        if (user.bot) { return; }

        console.log(user.username + ' is speaking: ' + speaking);

        let visible = speaking.bitfield == 0 ? false : true;
        obs.setStaticMemberVisibility(user.username, visible);
    });
}

module.exports = {
    connect,
    createEventHandlers
}