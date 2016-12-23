/*
  Music Player
  based from chalda/DiscordBot
  
  original codebase by Einadin, modified for owo-whats-this by Capuccino
*/

const YoutubeDL = require('youtube-dl');
const Request = require('request');
const Promise = require('bluebird');

exports.commands = [
    "play",
    "skip",
    "queue",
    "pause",
    "resume",
    "volume"
];

let options = false;
let PREFIX = (options && options.prefix) || 'm.';
let GLOBAL_QUEUE = (options && options.global) || false;
let MAX_QUEUE_SIZE = (options && options.maxQueueSize) || 20;
// Create an object of queues.
let queues = {};
//get queue function w

function getQueue(server) {
    // Check if global queues are enabled.
    if (GLOBAL_QUEUE) server = '_'; // Change to global queue.

    // Return the queue.
    if (!queues[server]) queues[server] = [];
    return queues[server];
}

exports.play = {
    desc: "play a song",
    longDesc: "play a song thru YT (or smth else?)",
    main: (bot, ctx) => {
        return new Promise((resolve, reject) => {
            var summoner = msg.guilds.channels.filter((v) => v.type === "voice").filter((v) => v.members.exists("id", ctx.msg.author.id));
            if (arr.length === 0) {
                ctx.msg.channel.sendMessage("You need to be in a voice channel to summon me!").then(() => {
                    reject([new Error(`user does not meet proper criteria to perform this action`)]).reject(err => ([err]));
                }); if(!suffix){
                    ctx.msg.channel.sendMessage().then(()=> {
                        reject([new Error("Bot has no files to parse and play.")]);
                    }).reject(err => ([err]));
                }
                //get the queue
                const queue = getQueue(ctx.msg.guild.id);
            }
        });
    },

    function wrap(text) {
    return '```\n' + text.replace(/`/g, '`' + String.fromCharCode(8203)) + '\n```';
}