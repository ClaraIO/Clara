/*
    Flan ES6 by Capuccino
    Original ES5 code by Ovyerus and MokouFujiwara
    Licensed under MIT.
    Copyright (c) 2016-2016 Capuccino, Ovyerus, MokouFujiwara, et al.
*/

//Framework imports
const Discord = require("discord-htc");
const fs = require("fs");
const util = require("util");
const JsonDB = require("node-json-db");

//Constants
const config = require('./config.json');
const bot = new Discord();
const data = new JsonDB('data', true, true);

//Init
bot.on('ready', () => {
    require('./init_commands.js').init();
    console.log("Auth token: " + config.auth);
    if (!data.data.admins) data.push('/', { admins: [] }, false);
    if (!data.data.blacklist) data.push('/', { blacklist: [] }, false);
    bot.config = config;
    bot.data = data;
});
//Don't place anything here, commands have their own JS files.
var commands = {};
// Synchronously works with init_commands.js. After init_commands checks for deps and returns a functioning command,
// this exports the following functioning command. Obsolete/broken commands aren't exported for a reason.
// We like to keep it that way.
exports.addCommand = function(commandName, commandObject) {
    try {
        commands[commandName] = commandObject;
    } catch (err) {
        console.log(err);
    }
}
exports.commandCount = function() {
    return Object.keys(commands).length;
};
bot.on("message", msg => {
    //giant ass CMD thing CP'ed from flan-chanbot.
    if (msg.content.startsWith(config.prefix)) {
        const args = msg.content.substring(config.prefix.length, msg.content.length).split(' ');
        const cmd = args.shift();
        const suffix = args.join(' ');
        if (commands[cmd] !== undefined) {
            if (data.getData('/blacklist').indexOf(msg.author.id) !== -1) return;
            try {
                if (commands[cmd].adminOnly && data.getData('/admins').indexOf(msg.author.id) !== -1) {
                    commands[cmd].main(bot, { msg: msg, args: args, suffix: suffix });
                } else if (commands[cmd].adminOnly && data.data.getData('/admins').indexOf(msg.author.id) === -1) {
                    msg.channel.sendMessage('That command is restricted to the bot owner/s.');
                } else {
                    commands[cmd].main(bot, { msg: msg, args: args, suffix: suffix });
                }
            } catch (err) {
                console.log(err);
                var errMsg = `Unexpected error while executing commmand \`${cmd}\`\n`;
                errMsg += '```js\n';
                errMsg += err + '\n';
                errMsg += '```';
                msg.channel.makeMessage(errMsg);
            }
        }
    }

    if (msg.content.startsWith("<@" + bot.user.id + "> prefix")) {
        bot.reply(msg.channel.id, "***My prefix is *** `" + coinfig.prefix + "`!");
    }
});
// if bot disconnects, this would pass up
bot.on("disconnected", () => {
    console.log("disconnected!, retrying...");
    try {
        !config.useEmail ? bot.connect(config.token) : bot.connect(config.email, config.password);
    } catch (err) {
        //let it terminate. PM2 will re-start the bot automatically.
        console.log("I tried. terminating...");
        process.exit(1);
    }
});

!config.useEmail ? bot.connect(config.token) : bot.connect(config.email, config.password);