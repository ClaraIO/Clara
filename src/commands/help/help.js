/*
 * help.js - Display information for all avaliable commands.
 * 
 * Contributed by Capuccino and Ovyerus.
 */



exports.commands = [
    'help'
];

exports.help = {
    desc: 'The help command.',
    fullDesc: 'Displays information for all the avaliable commands in the bot. If an argument is given, displays additional information on that command.',
    usage: '[command]',
    main: (bot, ctx) => {
        return new Promise((resolve, reject) => {
            if (ctx.args.length === 0) {
                var helpTxt = '```armasm\n';
                var alphabeticalSort = [];
                helpTxt += `; ${bot.user.username}'s Help\n`;
                for (let command in bot.commands) {
                    alphabeticalSort.push(command);
                }
                alphabeticalSort.sort();
                for (let command of alphabeticalSort) {
                    let cmd = bot.commands[command];
                    helpTxt += `"${command}"${cmd.usage ? ` ${cmd.usage}` : ''} - "${cmd.desc}"\n`;
                }
                helpTxt += '```\nIf you need support or have suggestions for features of Nodetori, join the Discord server. https://discord.gg/rmMTZue';
                ctx.msg.channel.createMessage('Sending the help message to your DMs').then(() => {
                    return ctx.msg.author.getDMChannel();
                }).then(dm => {
                    return dm.createMessage(helpTxt);
                }).then(resolve).catch(reject);
            } else {
                if (!bot.commands[ctx.args[0]]) {
                    ctx.msg.channel.createMessage('That command does not exist. Make sure to check your spelling.').then(resolve).catch(reject);
                } else {
                    let cmd = bot.commands[ctx.args[0]];
                    var cmdHelp = '```armasm\n';
                    cmdHelp += `"${ctx.args[0]}"${cmd.usage ? ` ${cmd.usage}` : ''} - "${cmd.fullDesc ? cmd.fullDesc : cmd.desc}"\n`;
                    cmdHelp += '```';
                    ctx.msg.channel.createMessage(cmdHelp).then(resolve).catch(reject);
                }
            }
        });
    }
};
