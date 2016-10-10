/*
    Flan ES6 by Capuccino
    Original ES5 code by Ovyerus and MokouFujiwara
    Licensed under MIT.
    Copyright (c) 2016-2016 Capuccino, Ovyerus, MokouFujiwara, et al.
*/

// Framework imports
import './lib/node';
import { Client } from "discord.js";
import { fs } from "fs";
import { util } from "util";
import { JsonDB } from 'node-json-db';

// Constants
const config = require('./config.json');
const bot = new Client();
const data = new JsonDB('data', true, true);

// Init method
bot.on("ready", () => {
    require('./init_commands.js').init();
    console.log("Auth token: " + config.auth);
    if (!data.data.admins) data.push('/', { admins: [] }, false);
    if (!data.data.blacklist) data.push('/', { blacklist: [] }, false);
    bot.config = config;
    bot.data = data;
});

// Don't place anything here, commands have their own JS files.
// Empty class to call the commands, constructor is left empty.
class Commands { constructor() {} };

// Synchronously works with init_commands.js. After init_commands checks for deps and returns a functioning command,
// this exports the following functioning command. Obsolete/broken commands aren't exported for a reason.
// We like to keep it that way.
export function addCommand(commandName, commandObject) {
    try {
        commands[commandName] = commandObject;
    } catch (err) {
        console.log(err);
    }
}
export function commandCount() {
    return Object.keys(commands).length;
};

bot.on("message", () => {
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
                msg.channel.sendMessage(errMsg);
            }
        }
    }

    if (msg.content.startsWith("<@" + bot.user.id + "> prefix")) {
        bot.reply(msg.channel.id, "***My prefix is *** `" + config.prefix + "`!");
    }
});

!config.useEmail ? bot.login(config.token) : bot.login(config.email, config.password);