/*
 *  anime.js - Search MyAnimeList for manga and anime
 * 
 *  Contributed by Capuccino and Ovyerus
 */


const mal = require('malapi').Anime;
const color = require('dominant-color');
const request = require('request');
const fs = require('fs');

exports.commands = [
    'anime'
];

function animeBlock(animu, color) {
    return {embed: {
        title: animu.title,
        url: animu.detailsLink,
        thumbnail: {url: animu.image},
        color: parseInt(color, 16),
        fields: [
            {name: localeManager.t('id', 'en-UK'), value: animu.id, inline: true},
            {name: localeManager.t('anime-japanese', 'en-UK'), value: animu.alternativeTitles.japanese.join(', ').substring(9).trim(), inline: true},
            {name: localeManager.t('anime-english', 'en-UK'), value: animu.alternativeTitles.english ? animu.alternativeTitles.english.join(', ').substring(8).trim() : 'None', inline: true},
            {name: localeManager.t('anime-synonyms', 'en-UK'), value: animu.alternativeTitles.synoynms ? animu.alternativeTitles.synoynms.join(',').substring(9).trim() : 'None', inline: true},
            {name: localeManager.t('anime-genres', 'en-UK'), value: animu.genres.join(', '), inline: true},
            {name: localeManager.t('anime-type', 'en-UK'), value: animu.type, inline: true},
            {name: localeManager.t('anime-episodes', 'en-UK'), value: animu.episodes, inline: true},
            {name: localeManager.t('anime-status', 'en-UK'), value: animu.status, inline: true},
            {name: localeManager.t('anime-aired', 'en-UK'), value: animu.aired, inline: true},
            {name: localeManager.t('anime-classification', 'en-UK'), value: animu.classification, inline: true},
            {name: animu.studios.length === 1 ? localeManager.t('anime-studio', 'en-UK') : localeManager.t('anime-studios', 'en-UK'), value: animu.studios.join(', '), inline: true},
            {name: localeManager.t('anime-score', 'en-UK'), value: animu.statistics.score.value, inline: true},
            {name: localeManager.t('anime-popularity', 'en-UK'),  value: animu.statistics.popularity, inline: true},
            {name: localeManager.t('anime-ranking', 'en-UK'), value: animu.statistics.ranking, inline: true}
        ]
    }}
}

exports.anime = {
    desc: 'Searches MyAnimeList for an anime.',
    fullDesc: 'Searches MyAnimeList for an anime either by name, id or url, automatically detecting it.',
    usage: '<anime name|id|url>',
    main: (bot, ctx) => {
        return new Promise((resolve, reject) => {
            if (!ctx.suffix) {
                ctx.msg.channel.createMessage(localeManager.t('anime-noArgs', 'en-UK')).then(resolve).catch(reject);
            } else {
                ctx.msg.channel.sendTyping();
                if (/^\d+$/.test(ctx.suffix)) {
                    mal.fromId(Number(ctx.suffix)).then(animu => {
                        var savePath = `${__baseDir}/cache/${animu.image.split('/')[animu.image.split('/').length - 1]}`;
                        request(animu.image).pipe(fs.createWriteStream(savePath)).on('close', () => {
                            color(savePath, (err, color) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    fs.unlink(savePath, () => {
                                        ctx.msg.channel.createMessage(animeBlock(animu, color)).then(resolve).catch(reject);
                                    });
                                }
                            });
                        });
                    }).catch(reject);
                } else if (/^https?:\/\/myanimelist\.net\/anime\/\d+\/.+$/.test(ctx.suffix)) {
                    mal.fromUrl(ctx.suffix).then(animu => {
                        var savePath = `${__baseDir}/cache/${animu.image.split('/')[animu.image.split('/').length - 1]}`;
                        request(animu.image).pipe(fs.createWriteStream(savePath)).on('close', () => {
                            color(savePath, (err, color) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    fs.unlink(savePath, () => {
                                        ctx.msg.channel.createMessage(animeBlock(animu, color)).then(resolve).catch(reject);
                                    });
                                }
                            });
                        });
                    }).catch(reject);
                } else {
                    mal.fromName(ctx.suffix).then(animu => {
                        var savePath = `${__baseDir}/cache/${animu.image.split('/')[animu.image.split('/').length - 1]}`;
                        request(animu.image).pipe(fs.createWriteStream(savePath)).on('close', () => {
                            color(savePath, (err, color) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    fs.unlink(savePath, () => {
                                        ctx.msg.channel.createMessage(animeBlock(animu, color)).then(resolve).catch(reject);
                                    });
                                }
                            });
                        });
                    }).catch(reject);
                }
            }
        });
    }
};