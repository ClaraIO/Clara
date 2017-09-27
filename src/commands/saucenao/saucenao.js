/*
 * saucenao.js - grab a image's source using saucenao. Grabs the last message attachment/URL, provided along with the command
 * or providing an attachment using the command as the caption.
 * 
 *  Contributed by Capuccino
 */

/* eslint-env node */

//this handles the SauceNao handling
const Sagiri = require('sagiri');
let ayaneru;

exports.init = bot => {
    ayaneru = new Sagiri({key: bot.config.sauceKey});
};

exports.commands = [
    'saucenao'
];

exports.saucenao = {
    desc: 'Gets the image from the recent attachment or via a image link and looks for saucenao to check for the source of the image.',
    main(bot, ctx) { 
        return new Promise((resolve, reject) => {
            if (!ctx.attachments[0]) {
                return ctx.createMessage('Aw, no image here.');
            } else if (ctx.attachments[0]) {
                ayaneru.getSauce(ctx.attachments[0].url).then(res => {
                    let fields =[];
                    let ovy = JSON.parse(res).results;
                    for (res.results in res) {
                        fields.push(`${{name: ovy.name, value: `(Link)[${ovy.url}]`}}`, 0);
                    }
                    ctx.createMessage({embed: {
                        title: 'Saucenao query results',
                        description: 'this is what we can find',
                        fields
                    }});
                }).catch(reject);
            } else if (ctx.suffix) {
                ayaneru.getSauce(ctx.suffix).then(res => {
                    let ovy = JSON.parse(res.results);
                    for (ovy.data of ovy) {
                        const fields = [];
                        fields.push(`${{name: ovy.title, value: `(Link)[${ovy.url}]`, inline: true}}`, 0);
                        ctx.createMessage({embed: {
                            title: 'saucenao query',
                            description: 'this is what we can find from your image.',
                            fields
                        }});
                    }
                }).catch(reject);
            }
        });
    }
};