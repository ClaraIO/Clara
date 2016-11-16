/*
 * owo-whats this - Core file
 * 
 * Contributed by:
 * | Ovyerus
 *
 * Licensed under MIT. Copyright (c) 2016 Capuccino, Ovyerus and the repository contributors.
 */

const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');
const bot = require(`${_baseDir}/bot.js`).bot;

function parse(content) {
    return new Promise((resolve, reject) => {
        if (typeof content !== 'string') reject(new Error('content is not a string'));

        var oldContent = content;
        var prefixes = JSON.parse(fs.readFileSync(`${_baseDir}/prefixes.json`));
        prefixes.push(`<@${bot.user.id}> `);
        
        if (!content.startsWith(bot.internal.config.mainPrefix)) {
            for (let i in prefixes) {
                if (content.startsWith(prefixes[i])) {
                    content = content.substring(prefixes[i].length);
                    break
                }
            }
        } else {
            content = content.substring(bot.internal.config.mainPrefix.length);
        }

        if (content !== oldContent) {
            resolve(content);
        } else {
            resolve();
        }
    });
}

module.exports = parse;