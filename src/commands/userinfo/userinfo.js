/*
 * userinfo.js - Get information of a user.
 *
 * Contributed by Capuccino and Ovyerus
 */

/* eslint-env node */

const utils = require(`${__baseDir}/modules/utils.js`);
const moment = require('moment');

exports.commands = [
    'userinfo'
];

function infoBlock(member, roles, color) {
    return {embed: {
        author: {name: utils.formatUsername(member.user), icon_url: member.bot ? 'https://cdn.discordapp.com/emojis/230105988211015680.png' : ''},
        description: `**[Full Avatar](${member.avatarURL})**`,
        thumbnail: {url: member.avatarURL},
        color: color,
        fields: [
            {name: 'Nickname', value: member.nick || 'None', inline: true},
            {name: 'ID', value: member.id, inline: true},
            {name: 'Status', value: member.status.replace(member.status[0], member.status[0].toUpperCase()), inline: true},
            {name: 'Game', value: !member.game ? 'None' : member.game.type === 0 ? member.game.name : `[${member.game.name}](${member.game.url})`, inline: true},
            {name: 'Permission Number', value: member.permission.allow, inline: true},
            {name: 'Joined At', value: `${moment(member.joinedAt).format('dddd Do MMMM Y')}\n${moment(member.joinedAt).format('HH:mm:ss A')}`, inline: true},
            {name: 'Roles', value: roles.join(', '), inline: true}
        ],
        footer: {text: `Account Created on ${moment(member.createdAt).format('dddd Do MMMM Y')} at ${moment(member.createdAt).format('HH:mm:ss A')}`}
    }};
}

exports.userinfo = {
    desc: "Check a user's info, or your own.",
    longDesc: `check someone's or your own userinfo`,
    usage: '[mention]',
    example: '@b1nzy#1337',
    main(bot, ctx) {
        return new Promise((resolve, reject) => {
            if (ctx.mentions.length === 0) {
                let roleColour = ctx.member.roles.sort((a, b) => {
                    return ctx.member.guild.roles.get(b).position - ctx.member.guild.roles.get(a).position;
                })[0];
                roleColour = roleColour ? ctx.channel.guild.roles.get(roleColour).color : 0;
                let roles = [];
                ctx.member.roles.forEach(r => {roles.push(ctx.channel.guild.roles.get(r).name);});
                ctx.createMessage(infoBlock(ctx.member, roles, roleColour)).then(resolve).catch(reject);
            } else {
                let member = ctx.channel.guild.members.get(ctx.mentions[0].id);
                let roleColour = member.roles.sort((a, b) => {
                    return member.guild.roles.get(b).position - member.guild.roles.get(a).position;
                })[0];
                roleColour = roleColour ? member.guild.roles.get(roleColour).color : 0;
                let roles = [];
                member.roles.forEach(r => {roles.push(member.guild.roles.get(r).name);});
                ctx.createMessage(infoBlock(member, roles, roleColour)).then(resolve).catch(reject);
            }
        });
    }
};
