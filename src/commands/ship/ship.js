/*
 * ship.js - Ship people.
 *
 * Contributed by Capuccino
 */

/* eslint-env node */

exports.commands = [
    'ship'
];

exports.ship = {
    desc: 'Ship people.',
    longDesc: "Takes half of each name given, and creates a 'ship name'.",
    usage: '<2 names or mentions>',
    main(bot, ctx) {
        return new Promise((resolve, reject) => {
            if (ctx.mentions.length > 2 || ctx.args.length > 2) {
                ctx.createMessage(localeManager.t('ship-noArgs', ctx.settings.locale)).then(resolve).catch(reject);
            } else {
                let a = ctx.mentions[0] === undefined ? ctx.args[0] : ctx.mentions[0].username;
                let b = ctx.mentions[1] === undefined ? ctx.args[1] : ctx.mentions[1].username;
                let result = a.substring(0, Math.floor(a.length / 2)) + b.substring(Math.floor(b.length / 2));

                ctx.createMessage(localeManager.t('ship', ctx.settings.locale, {result})).then(() => resolve).catch(reject);
            }
        });
    }
};