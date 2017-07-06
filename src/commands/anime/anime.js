/*
 *  anime.js - Search MyAnimeList for anime
 *
 *  Contributed by Capuccino and Ovyerus
 */

/* eslint-env node */

const mal = require('malapi').Anime;

exports.commands = [
    'anime'
];

exports.anime = {
    desc: 'Searches MyAnimeList for an anime.',
    fullDesc: 'Searches MyAnimeList for an anime either by name, id or url, automatically detecting it.',
    usage: '<anime name|id|url>',
    main(bot, ctx) {
        return new Promise((resolve, reject) => {
            if (!ctx.suffix) {
                ctx.createMessage(localeManager.t('anime-noArgs', ctx.settings.locale)).then(resolve).catch(reject);
            } else {
                ctx.channel.sendTyping();
                if (/^\d+$/.test(ctx.suffix)) {
                    mal.fromId(Number(ctx.suffix)).then(animu => {
                        return ctx.createMessage(animeBlock(animu, ctx.settings));
                    }).then(resolve).catch(reject);
                } else if (/^https?:\/\/myanimelist\.net\/anime\/\d+\/.+$/.test(ctx.suffix)) {
                    mal.fromUrl(ctx.suffix).then(animu => {
                        return ctx.createMessage(animeBlock(animu, ctx.settings));
                    }).then(resolve).catch(reject);
                } else {
                    mal.fromName(ctx.suffix).then(animu => {
                        return ctx.createMessage(animeBlock(animu, ctx.settings));
                    }).then(resolve).catch(reject);
                }
            }
        });
    }
};

function animeBlock(animu, settings) {
    return {embed: {
        title: animu.title,
        url: animu.detailsLink,
        thumbnail: {url: animu.image},
        fields: [
            {name: localeManager.t('id', settings.locale), value: animu.id, inline: true},
            {name: localeManager.t('anime-japanese', settings.locale), value: animu.alternativeTitles.japanese.join(', ').substring(9).trim(), inline: true},
            {name: localeManager.t('anime-english', settings.locale), value: animu.alternativeTitles.english ? animu.alternativeTitles.english.join(', ').substring(8).trim() : 'None', inline: true},
            {name: localeManager.t('anime-synonyms', settings.locale), value: animu.alternativeTitles.synoynms ? animu.alternativeTitles.synoynms.join(',').substring(9).trim() : 'None', inline: true},
            {name: localeManager.t('anime-genres', settings.locale), value: animu.genres.join(', '), inline: true},
            {name: localeManager.t('anime-type', settings.locale), value: animu.type, inline: true},
            {name: localeManager.t('anime-episodes', settings.locale), value: animu.episodes, inline: true},
            {name: localeManager.t('anime-status', settings.locale), value: animu.status, inline: true},
            {name: localeManager.t('anime-aired', settings.locale), value: animu.aired, inline: true},
            {name: localeManager.t('anime-classification', settings.locale), value: animu.classification, inline: true},
            {name: animu.studios.length === 1 ? localeManager.t('anime-studio', settings.locale) : localeManager.t('anime-studios', settings.locale), value: animu.studios.join(', '), inline: true},
            {name: localeManager.t('anime-score', settings.locale), value: animu.statistics.score.value, inline: true},
            {name: localeManager.t('anime-popularity', settings.locale),  value: animu.statistics.popularity, inline: true},
            {name: localeManager.t('anime-ranking', settings.locale), value: animu.statistics.ranking, inline: true}
        ]
    }};
}