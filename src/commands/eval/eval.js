/*
 * eval.js - Evaluate JavaScript code in Discord.
 * 
 * Contributed by Ovyerus.
 */


const util = require('util');

exports.commands = [
    'eval'
];

exports.eval = {
    desc: 'Evaluate code in Discord.',
    fullDesc: 'Used to evaluate JavaScript code in Discord. Mostly for debug purposes.',
    adminOnly: true,
    usage: '<code>',
    main: (bot, ctx) => {
        return new Promise((resolve, reject) => {
            if (ctx.suffix.length === 0) {
                ctx.msg.channel.createMessage('Please give arguments to evaluate.').then(resolve).catch(reject);
            } else {
                var evalArgs = cx.suffix;
                try {
                    var returned = eval(evalArgs);
                    var str = util.inspect(returned, {depth: 1});
                    str = str.replace(new RegExp(bot.token, 'gi'), '(token)');

                    var sentMessage = '```js\n';
                    sentMessage += `Input: ${evalArgs}\n\n`;
                    sentMessage += `Output: ${str}\n`;
                    sentMessage += '```';

                    if (sentMessage.length > 1897) {
                        sentMessage = sentMessage.substr(0, 1897);
                        sentMessage = sentMessage + '...\n````';
                    }

                    ctx.msg.channel.createMessage(sentMessage).then(resolve).catch(reject);
                } catch(err) {

                    var errMessage = '```js\n';
                    errMessage += `Input: ${evalArgs}\n\n`;
                    errMessage += `${err}\n`;
                    errMessage += '```';

                    if (errMessage.length > 1897) {
                        errMessage = errMessage.substr(0, 1897);
                        errMessage = errMessage + '...\n```';
                    }

                    ctx.msg.channel.createMessage(errMessage).then(resolve).catch(reject);
                }
            }
        });
    }
};