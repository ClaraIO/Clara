/**
 * @file Awau
 * @author Capuccino
 * @author Ovyerus
 */

/* eslint-env node */

const fs = require('fs');

exports.commands = [
    'awau'
];

exports.awau = {
    desc: 'Awaus at you.',
    main(bot, ctx) {
        return new Promise((resolve, reject) => {
            ctx.channel.sendTyping();
            let files = fs.readdirSync(`${__baseDir}/assets/awau`);
            let file = fs.readFileSync(`${__baseDir}/assets/awau/${files[Math.floor(Math.random() * files.length)]}`);
            ctx.createMessage('', {file, name: 'awau.png'}).then(resolve).catch(reject);
        });
    } 
};