/*
 * prefixes.js - Add/remove and view alternative prefixes
 *
 * Contributed by Ovyerus
 */

/* eslint-env node*/

const fs = require('fs');

exports.loadAsSubcommands = true;

exports.commands = [
    'add',
    'remove'
];

exports.main = {
    desc: 'View the various prefixes used by the bot and edit them.',
    fullDesc: 'Prefixes command. If no arguments are supplied or are not the correct ones, it just displays the available prefixes. Adding and removing prefixes are only allowed by the bot owners(s)',
    usage: '[<add|remove> <prefix>]',
    main(bot, ctx) {
        return new Promise((resolve, reject) => {
            let prefixes = JSON.parse(fs.readFileSync(`${__baseDir}/data/prefixes.json`));
            let embed = {
                title: 'Current Prefixes',
                description: `Displaying **${prefixes.length + 2}** prefixes.`,
                fields: [
                    {name: 'Internal Prefixes', value: `\`${bot.config.mainPrefix}\`\n\`@mention\``}
                ]
            };

            if (prefixes.length > 0) {
                embed.fields.push({name: 'External Prefixes', value: []});
                prefixes.forEach(prefix => embed.fields[1].value.push(prefix.endsWith(' ') ? `\`${prefix}\u200b\`` : `\`${prefix}\``));
                embed.fields[1].value = embed.fields[1].value.join('\n');
            }

            ctx.msg.channel.createMessage({embed}).then(resolve).catch(reject);
        });
    }
};

exports.add = {
    desc: 'Add a prefix.',
    usage: '<prefix>',
    adminOnly: true,
    main(bot, ctx) {
        return new Promise((resolve, reject) => {
            if (ctx.args.length === 0) {
                ctx.msg.channel.createMessage('Please give me a prefix to add.').then(resolve).catch(reject);
            } else {
                let prefix = ctx.args.join(' ');
                let newPrefixes = JSON.stringify(JSON.parse(fs.readFileSync(`${__baseDir}/data/prefixes.json`)).concat(prefix));
                fs.writeFile(`${__baseDir}/data/prefixes.json`, newPrefixes, err => {
                    if (err) {
                        reject(err);
                    } else {
                        ctx.msg.channel.createMessage(`Added prefix \`${prefix}\``).then(resolve).catch(reject);
                    }
                });
            }
        });
    }
};

exports.remove = {
    desc: 'Remove a prefix.',
    usage: '<prefix>',
    adminOnly: true,
    main(bot, ctx) {
        return new Promise((resolve, reject) => {
            if (ctx.args.length === 0) {
                ctx.msg.channel.createMessage('Please give me a prefix to remove.').then(resolve).catch(reject);
            } else {
                let prefix = ctx.args.join(' ');
                let prefixes = JSON.parse(fs.readFileSync(`${__baseDir}/data/prefixes.json`));
                let newPrefixes = prefixes.filter(p => p !== prefix);
                console.log(newPrefixes);

                if (newPrefixes.equals(prefixes)) {
                    ctx.msg.channel.createMessage("That prefix doesn't exist or can't be removed.");
                } else {
                    fs.writeFile(`${__baseDir}/data/prefixes.json`, JSON.stringify(newPrefixes), err => {
                        if (err) {
                            reject(err);
                        } else {
                            ctx.msg.channel.createMessage(`Removed prefixes \`${prefix}\``).then(resolve).catch(reject);
                        }
                    });
                }
            }
        });
    }
};

Array.prototype.equals = array => {
    if (!array || this.length !== array.length) return false;

    for (var i = 0, l=this.length; i < l; i++) {
        if (this[i] instanceof Array && array[i] instanceof Array) {
            if (!this[i].equals(array[i])) {
                return false;
            }
        } else if (this[i] !== array[i]) {
            return false;
        }
    }

    return true;
};

Object.defineProperty(Array.prototype, 'equals', {enumerable: false});