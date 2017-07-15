/**
 * @file Make the bot choose your stupid life decisions.
 * @author Capuccino
 * @author Ovyerus
 */

/* eslint-env node */

exports.commands = [
    'choose'
];

exports.choose = {
    desc: 'Randomly chooses between 2 or more arguments.',
    fullDesc: 'Uses a randomiser to pick a random value out of two given arguments.',
    usage: '<choice 1>/<choice 2>/...',
    example: 'coke zero/coke',
    main(bot, ctx) {
        return new Promise((resolve, reject) => {
            let choices = ctx.suffix.split('/');
            if (choices.length < 2) {
                ctx.msg.channel.createMessage('choose-insufficientArgs').then(resolve).catch(reject);
            } else {
                var choice = choices[Math.floor(Math.random() * choices.length)];
                ctx.msg.channel.createMessage(localeManager.t('choose', ctx.settings.locale, {name: ctx.msg.author.username, choice})).then(resolve).catch(reject);
            }
        });
    }
};