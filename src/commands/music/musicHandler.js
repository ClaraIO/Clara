/*
 * Clara - music handler module
 *
 * Contributed by Ovvyerus
 */

const config = require(`${__baseDir}/config.json`);
const ytdl = require('youtube-dl');
const ytSearch = require('youtube-search');
const twitch = require('twitch.tv');
const twitchStream = require('twitch-get-stream')(config.twitchKey);
const request = require('request');
const PassThrough = require('stream').PassThrough;
const utils = require(`${__baseDir}/lib/utils`);

var ytRegex = exports.ytRegex = str => /(https?:\/\/)?(www\.|m.)?youtube\.com\/watch\?v=.+(&.+)?/.test(str) || /(https?:\/\/)?youtu\.be\/.+/.test(str);
var scRegex = exports.scRegex = str => /(https?:\/\/)?soundcloud\.com\/.+\/.+/.test(str);
var clypRegex = exports.clypRegex = str => /(https?:\/\/)?clyp\.it\/.+/.test(str);
var twitchRegex = exports.twitchRegex = str => /(https?:\/\/)?twitch\.tv\/.+/.test(str);
var allRegex = exports.allRegex = str => ytRegex(str) || scRegex(str) || clypRegex(str) || twitchRegex(str); // eslint-disable-line no-unused-vars
exports.exposed = {};

var search = exports.search = (msg, terms) => { // eslint-disable-line no-unused-vars
    return new Promise((resolve, reject) => {
        let {bot, settings} = exports.exposed;
        ytSearch(terms, {maxResults: 10, key: bot.config.ytSearchKey}, (err, res) => {
            if (err) {
                reject(err);
            } else {
                res = res.filter(r => r.kind === 'youtube#video');
                if (res.length > 0) {
                    let embed = {
                        title: localeManager.t('music-searchHeader', settings.locale),
                        description: localeManager.t('music-searchExplanation', settings.locale),
                        fields: []
                    };

                    for (let i = 0; i <= 4; i++) {
                        if (!res[i]) break;
                        embed.fields.push({name: `${i + 1}: ${res[i].channelTitle}`, value: res[i].title});
                    }

                    let outerMsg;
                    msg.channel.createMessage({embed}).then(m => {
                        outerMsg = m;
                        return bot.awaitMessage(msg.channel.id, msg.author.id);
                    }).then(m => {
                        if (/^[1-5]$/.test(m.content.split(' ')[0])) {
                            let choice = Number(m.content.split(' ')[0]) - 1;
                            choice = res[choice];
                            outerMsg.delete();
                            return {msg: m, url: choice.link};
                        } else {
                            outerMsg.delete();
                            return m.channel.createMessage(localeManager.t('music-invalidOpt', settings.locale));
                        }
                    }).then(resolve).catch(reject);
                } else {
                    msg.channel.createMessage(localeManager.t('music-searchNoResults', settings.locale)).then(resolve).catch(reject);
                }
            }
        });
    });
};

var play = exports.play = (msg, url) => {
    return new Promise((resolve, reject) => {
        let {bot, settings} = exports.exposed;
        if (!bot.music.connections.get(msg.channel.guild.id)) {
            queue(msg, url).then(() => {
                return bot.joinVoiceChannel(msg.member.voiceState.channelID);
            }).then(cnc => {
                bot.music.connections.add(cnc);
                return getStream(url);
            }).then(res => {
                let [stream, type] = res;
                let cnc = bot.music.connections.get(msg.channel.guild.id);
                let info = bot.music.queues.get(msg.channel.guild.id).q[0].info;
                bot.music.streams.add({id: msg.channel.guild.id, stream, type});
                cnc.play(stream, {encoderArgs: ['-af', 'volume=0.5']});

                if (typeof stream === 'object') {
                    stream.once('data', () => {
                        msg.channel.createMessage({embed: {
                            title: localeManager.t('music-nowPlayingHeader', settings.locale),
                            description: localeManager.t('music-nowPlayingSong', settings.locale, {title: info.title, url, time: typeof info.length === 'number' ? timeFormat(info.length) : info.length}),
                            image: {url: info.thumbnail},
                            footer: {text: localeManager.t('music-nowPlayingFooter', settings.locale, {user: utils.formatUsername(msg.member), type})}
                        }});
                    });
                } else {
                    msg.channel.createMessage({embed: {
                        title: localeManager.t('music-nowPlayingHeader', settings.locale),
                        description: localeManager.t('music-nowPlayingSong', settings.locale, {title: info.title, url, time: typeof info.length === 'number' ? timeFormat(info.length) : info.length}),
                        image: {url: info.thumbnail},
                        footer: {text: localeManager.t('music-nowPlayingFooter', settings.locale, {user: utils.formatUsername(msg.member), type})}
                    }});
                }

                cnc.on('error', err => {
                    logger.customError('voiceConnection', `Error in voice connection in guild '${bot.guilds.get(cnc.id).name}' (${cnc.id}):\n${err}`);
                    msg.channel.createMessage(err);
                });

                cnc.once('end', function() {
                    if (cnc.playing || !bot.music.queues.get(msg.channel.guild.id) || bot.music.stopped.indexOf(msg.channel.guild.id) > -1) return;
                    let q = bot.music.queues.get(msg.channel.guild.id).q;
                    if (q[0].url === url) {
                        q.splice(0, 1);
                        bot.music.streams.delete(msg.channel.guild.id);
                    }
                    if (q.length > 0) play(q[0].msg, q[0].url);
                    this.removeAllListeners('error');
                });
            }).then(resolve).catch(reject);
        } else if (bot.music.connections.get(msg.channel.guild.id) && (!bot.music.queues.get(msg.channel.guild.id) || bot.music.queues.get(msg.channel.guild.id).q.length === 0)) {
            queue(msg, url).then(() => {
                return getStream(url);
            }).then(res => {
                let [stream, type] = res;
                let cnc = bot.music.connections.get(msg.channel.guild.id);
                let info = bot.music.queues.get(msg.channel.guild.id).q[0].info;
                bot.music.streams.add({id: msg.channel.guild.id, stream, type});
                cnc.play(stream, {encoderArgs: ['-af', 'volume=0.5']});

                if (typeof stream === 'object') {
                    stream.once('data', () => {
                        msg.channel.createMessage({embed: {
                            title: localeManager.t('music-nowPlayingHeader', settings.locale),
                            description: localeManager.t('music-nowPlayingSong', settings.locale, {title: info.title, url, time: typeof info.length === 'number' ? timeFormat(info.length) : info.length}),
                            image: {url: info.thumbnail},
                            footer: {text: localeManager.t('music-nowPlayingFooter', settings.locale, {user: utils.formatUsername(msg.member), type})}
                        }});
                    });
                } else {
                    msg.channel.createMessage({embed: {
                        title: localeManager.t('music-nowPlayingHeader', settings.locale),
                        description: localeManager.t('music-nowPlayingSong', settings.locale, {title: info.title, url, time: typeof info.length === 'number' ? timeFormat(info.length) : info.length}),
                        image: {url: info.thumbnail},
                        footer: {text: localeManager.t('music-nowPlayingFooter', settings.locale, {user: utils.formatUsername(msg.member), type})}
                    }});
                }

                cnc.on('error', err => {
                    logger.customError('voiceConnection', `Error in voice connection in guild '${bot.guilds.get(cnc.id).name}' (${cnc.id}):\n${err}`);
                    msg.channel.createMessage(err);
                });

                cnc.once('end', function() {
                    if (cnc.playing || !bot.music.queues.get(msg.channel.guild.id) || bot.music.stopped.indexOf(msg.channel.guild.id) > -1) return;
                    let q = bot.music.queues.get(msg.channel.guild.id).q;
                    if (q[0].url === url) {
                        q.splice(0, 1);
                        bot.music.streams.delete(msg.channel.guild.id);
                    }
                    if (q.length > 0) play(q[0].msg, q[0].url);
                    this.removeAllListeners('error');
                });
            }).then(resolve).catch(reject);
        } else if (bot.music.connections.get(msg.channel.guild.id) && bot.music.queues.get(msg.channel.guild.id).q.length > 0 && bot.music.queues.get(msg.channel.guild.id).q[0].url === url) {
            getStream(url).then(res => {
                let [stream, type] = res;
                let cnc = bot.music.connections.get(msg.channel.guild.id);
                let info = bot.music.queues.get(msg.channel.guild.id).q[0].info;
                bot.music.streams.add({id: msg.channel.guild.id, stream, type: 'YouTubeVideo'});
                cnc.play(stream, {encoderArgs: ['-af', 'volume=0.5']});

                if (typeof stream === 'object') {
                    stream.once('data', () => {
                        msg.channel.createMessage({embed: {
                            title: localeManager.t('music-nowPlayingHeader', settings.locale),
                            description: localeManager.t('music-nowPlayingSong', settings.locale, {title: info.title, url, time: typeof info.length === 'number' ? timeFormat(info.length) : info.length}),
                            image: {url: info.thumbnail},
                            footer: {text: localeManager.t('music-nowPlayingFooter', settings.locale, {user: utils.formatUsername(msg.member), type})}
                        }});
                    });
                } else {
                    msg.channel.createMessage({embed: {
                        title: localeManager.t('music-nowPlayingHeader', settings.locale),
                        description: localeManager.t('music-nowPlayingSong', settings.locale, {title: info.title, url, time: typeof info.length === 'number' ? timeFormat(info.length) : info.length}),
                        image: {url: info.thumbnail},
                        footer: {text: localeManager.t('music-nowPlayingFooter', settings.locale, {user: utils.formatUsername(msg.member), type})}
                    }});
                }

                cnc.on('error', err => {
                    logger.customError('voiceConnection', `Error in voice connection in guild '${bot.guilds.get(cnc.id).name}' (${cnc.id}):\n${err}`);
                    msg.channel.createMessage(err);
                });

                cnc.once('end', function() {
                    if (cnc.playing || !bot.music.queues.get(msg.channel.guild.id) || bot.music.stopped.indexOf(msg.channel.guild.id) > -1) return;
                    let q = bot.music.queues.get(msg.channel.guild.id).q;
                    if (q[0].url === url) {
                        q.splice(0, 1);
                        bot.music.streams.delete(msg.channel.guild.id);
                    }
                    if (q.length > 0) play(q[0].msg, q[0].url);
                    this.removeAllListeners('error');
                });
            }).then(resolve).catch(reject);
        } else if (bot.music.connections.get(msg.channel.guild.id) && bot.music.queues.get(msg.channel.guild.id).q.length > 0 && bot.music.queues.get(msg.channel.guild.id).q[0].url !== url && bot.music.connections.get(msg.channel.guild.id).playing) {
            queue(msg, url).then(resolve).catch(reject);
        }
    });
};

var queue = exports.queue = (msg, url) => {
    return new Promise((resolve, reject) => {
        let {bot, settings} = exports.exposed;
        if (!bot.music.queues.get(msg.channel.guild.id)) bot.music.queues.add({id: msg.channel.guild.id, q: []});
        let q = bot.music.queues.get(msg.channel.guild.id).q;

        getSongInfo(url).then(info => {
            q.push({url, requestee: msg.author.id, msg, info, timestamp: Date.now()});
            return msg.channel.createMessage(localeManager.t('music-queuedItem', settings.locale, {title: info.title, position: q.length}));
        }).then(resolve).catch(reject);
    });
};

var getStream = exports.getStream = song => {
    return new Promise((resolve, reject) => {
        if (ytRegex(song)) {
            resolve([ytdl(song), 'YouTubeVideo']);
        } else if (scRegex(song)) {
            resolve([ytdl(song), 'SoundCloudTrack']);
        } else if (clypRegex(song)) {
            let id = song.split('/');
            id = id[id.length - 1];
            request(`https://api.clyp.it/${id}`, (err, resp, body) => {
                if (err) {
                    reject(err);
                } else if (resp.statusCode !== 200) {
                    reject(new Error(`Invalid status code: ${resp.statusCode}`));
                } else {
                    let stream = new PassThrough();
                    resolve([request(JSON.parse(body).Mp3Url).pipe(stream), 'ClypAudio']);
                }
            });
        } else if (twitchRegex(song)) {
            let user = song.split('/');
            user = user[user.length - 1];
            twitchStream.get(user).then(res => {
                let want = res.filter(r => r.quality === 'Audio Only')[0];
                if (!want) {
                    reject(new Error('Unable to get ideal quality for Twitch stream.'));
                } else {
                    resolve([want.url, 'TwitchStream']);
                }
            }).catch(reject);
        } else {
            reject(new Error(`Could not get stream for ${song}`));
        }
    });
};

var getSongInfo = exports.getSongInfo = song => {
    return new Promise((resolve, reject) => {
        if (ytRegex(song)) {
            ytdl.getInfo(song, (err, info) => {
                if (err) {
                    reject(err);
                } else {
                    let res = {title: info.fulltitle, uploader: info.uploader, thumbnail: info.thumbnail, length: formatToSeconds(info.duration), type: 'YouTubeVideo'};
                    resolve(res);
                }
            });
        } else if (scRegex(song)) {
            ytdl.getInfo(song, (err, info) => {
                if (err) {
                    reject(err);
                } else {
                    let res = {title: info.title, uploader: info.uploader, thumbnail: info.thumbnail, length: formatToSeconds(info.duration), type: 'SoundCloudTrack'};
                    resolve(res);
                }
            });
        } else if (clypRegex(song)) {
            let id = song.split('/');
            id = id[id.length -1];
            request(`https://api.clyp.it/${id}`, (err, resp, body) => {
                if (err) {
                    reject(err);
                } else if (resp.statusCode !== 200) {
                    reject(new Error(`Invalid status code: ${resp.statusCode}`));
                } else {
                    let info = JSON.parse(body);
                    let res = {title: info.Title, uploader: 'N/A', thumbnail: info.ArtworkPictureUrl || 'https://static.clyp.it/site/images/logos/clyp-og-1200x630.png', length: Math.floor(info.Duration), type: 'ClypAudio'};
                    resolve(res);
                }
            });
        } else if (twitchRegex(song)) {
            let user = song.split('/');
            user = user[user.length - 1];
            twitch(`streams/${user}/`, {clientID: config.twitchKey}, (err, info) => {
                if (err) {
                    reject(err);
                } else {
                    info = info.stream.channel;
                    let res = {title: info.status, uploader: info.display_name, thumbnail: info.video_banner, length: 'Unknown', type: 'TwitchStream'};
                    resolve(res);
                }
            });
        }
    });
};

var timeFormat = exports.timeFormat = secs => {
    let seconds = secs % 60;
    let minutes = (secs / 60) % 60;
    let hours = (minutes / 60) % 24;

    seconds = Math.floor(seconds);
    minutes = Math.floor(minutes);
    hours = Math.floor(hours);

    seconds.toString().length === 1 ? seconds = `0${seconds.toString()}` : seconds = seconds.toString();
    minutes.toString().length === 1 && hours !== 0 ? minutes = `0${minutes.toString()}` : minutes = minutes.toString();

    return `${hours === 0  ? '' : `${hours}:`}${minutes}:${seconds}`;
};

var formatToSeconds =  exports.formatToSeconds = time => {
    let splitted = time.split(':');
    return Number(splitted[0]) * 60 + Number(splitted[1]);
};
