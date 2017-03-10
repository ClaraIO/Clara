// * NASA APOD Parser
// * For Spacefags
// *
// * Contributed by Capuccino

exports.commands = [
    'apod'
];

const request = require('request');

exports.apod = {
    desc: "Shows NASA's [Astronomy Picture of the Day](http://apod.nasa.gov/apod/astropix.html) (APOD)",
    main: (bot, ctx) => {
        return new Promise((resolve, reject) => {
            if (!bot.config.nasaKey) {
                ctx.msg.channel.createMessage(localeManager.t('nasa-noKey', 'en-UK')).then(resolve).catch(reject);
            } else {
                request(`https://api.nasa.gov/planetary/apod?api_key=${bot.config.nasaKey}`, (err, resp, body) => {
                    if (err) {
                        reject(err);
                    } else if (resp.statusCode !== 200) {
                        reject(new Error(`Invalid status code: ${resp.statusCode}`));
                    } else {
                        let data = JSON.parse(body);
                        ctx.msg.channel.createMessage({embed: {
                            title: data.title,
                            description: data.copyright ? localeManager.t('nasa-copyright', 'en-UK', {copyright: data.copyright}) : '',
                            thumbnail:{url: 'https://api.nasa.gov/images/logo.png'},
                            color: 0xFD7BB5,
                            image: {url: data.url},
                            fields: [
                                {name: localeManager.t('nasa-explanation', 'en-UK'), value: data.explanation}
                            ],
                            footer: {text: localeManager.t('nasa-date', 'en-UK', {date: data.date})}
                        }}).then(resolve).catch(reject);
                    }
                });
            }
        });
    }
};