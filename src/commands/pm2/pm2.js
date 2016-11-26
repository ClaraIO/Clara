/*
 * remote_process_ctrl.js - control pm2 from Discord
 * 
 * Contributed by Capuccino
 * NOTE: This is dedicated for PM2 and will ONLY work for PM2.
 */

const Promise = require('bluebird');
const ovy = require('child_process');
var process_react = "";
const bot = ovy.exec('pm2', [process_react,'bot']);

exports.command = [
    'core_restart',
    'core_shutdown'
];

exports.core_restart = {
    desc : 'BOTDEVELOPER ONLY! Restarts the PM2 session of the bot',
    adminOnly : true,
    main : (bot, ctx) => {
        return new Promise((resolve,reject) => {
            var process_react = "restart";
            //TODO: add a clock to delay the command for 3 seconds
            ctx.msg.channel.sendMessage("Restarting NOW!").then(() => resolve()).catch(err => reject([err]));
        })
    }
};
 exports.core_shutdown = {
     desc: 'BOTDEVELOPER ONLY! Shutdowns the PM2 session of the bot',
     adminOnly: true,
     main : (bot,ctx) => {
         return new Promise((resolve,reject) => {
             var process_react = "shutdown";
             //TODO: add a clock to delay the command for 3 seconds
               ctx.msg.channel.sendMessage("Shutting Down....").then(() => resolve()).catch(err => reject([err]));
         });
     }
 }