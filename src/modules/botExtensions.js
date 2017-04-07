/* eslint-env node */

const got = require('got');

module.exports = bot => {

    /**
    * Wait for a message in the specified channel from the specified user.
    *
    * @param {String} channelID ID of channel to wait in.
    * @param {String} userID ID of user to wait for.
    * @param {Function} [filter] Filter to pass to message. Must return true.
    * @param {Number} [timeout=15000] Time in milliseconds to wait for message.
    * @returns {Promise<Eris.Message>} Awaited message.
    */
    bot.awaitMessage = (channelID, userID, filter = () => true, timeout = 15000) => {
        return new Promise((resolve, reject) => {
            if (!channelID || typeof channelID !== 'string') {
                reject(new TypeError('channelID is not string.'));
            } else if (!userID || typeof userID !== 'string') {
                reject(new TypeError('userId is not string.'));
            } else {
                var responded, rmvTimeout;

                var onCrt = msg => {
                    if (msg.channel.id === channelID && msg.author.id === userID && filter(msg)) {
                        responded = true;
                        return msg;
                    }
                };

                var onCrtWrap = msg => {
                    var res = onCrt(msg);
                    if (responded) {
                        bot.removeListener('messageCreate', onCrtWrap);
                        clearInterval(rmvTimeout);
                        resolve(res);
                    }
                };

                bot.on('messageCreate', onCrtWrap);

                rmvTimeout = setTimeout(() => {
                    if (!responded) {
                        bot.removeListener('messageCreate', onCrtWrap);
                        reject(new Error('Message await expired.'));
                    }
                }, timeout);
            }
        });
    };

    /**
    * POSTs guild count to DBots.
    */
    bot.postGuildCount = () => {
        if (bot.config.discordBotsKey) {
            got(`https://bots.discord.pw/api/bots/${bot.user.id}/stats`, {
                method: 'POST',
                headers: {Authorization: bot.config.discordBotsKey, 'Content-Type': 'application/json'},
                body: JSON.stringify({server_count: bot.guilds.size})
            }).then(() => {
                logger.info('POSTed to DBots.');
            }).catch(err => logger.warn(`Unable to POST to DBots: ${err}`));
        }
    };

    /**
    * Get the settings for a guild.
    *
    * @param {String} guildID ID of guild to get settings for.
    * @returns {Promise<Object>} Settings for the guild.
    */
    bot.getGuildSettings = guildID => {
        return new Promise((resolve, reject) => {
            if (typeof guildID !== 'string') {
                reject(new TypeError('guildID is not string.'));
            } else {
                if (bot.settings.guilds.get(guildID)) {
                    resolve(bot.settings.guilds.get(guildID));
                } else {
                    bot.db.table('guild_settings').get(guildID).run().then(res => {
                        if (!res) {
                            return bot.initGuildSettings(guildID);
                        } else {
                            bot.settings.guilds.add(res);
                            resolve(res);
                        }
                    }).then(res => {
                        if (res) {
                            resolve(res);
                        } else {
                            return null;
                        }
                    }).catch(reject);
                }
            }
        });
    };

    /**
    * Initialize settings for a guild.
    *
    * @param {String} guildID ID of guild to init settings for.
    * @returns {Promise<Object>} Settings for the guild.
    */
    bot.initGuildSettings = guildID => {
        return new Promise((resolve, reject) => {
            if (typeof guildID !== 'string') {
                reject(new TypeError('guildID is not string.'));
            } else {
                let settings = {id: guildID, locale: 'en-UK', greeting: {enabled: false, channelID: null, message: null}};
                bot.settings.guilds.add(settings);
                bot.db.table('guild_settings').get(guildID).run().then(res => {
                    if (res) {
                        return res;
                    } else {
                        return bot.db.table('guild_settings').insert(settings).run();
                    }
                }).then(res => {
                    resolve(res);
                }).catch(reject);
            }
        });
    };

    /**
    * Edit a guild's settings.
    *
    * @param {String} guildID ID of guild to edit settings for.
    * @param {Object} settings Settings to change.
    * @returns {Promise<Object>} Updated settings for the guild.
    */
    bot.setGuildSettings = (guildID, settings = {}) => {
        return new Promise((resolve, reject) => {
            if (typeof guildID !== 'string') {
                reject(new TypeError('guildID is not string.'));
            } else if (Object.keys(settings).length === 0) {
                reject(new Error('No settings.'));
            } else {
                bot.db.table('guild_settings').get(guildID).update(settings).run().then(() =>
                    bot.db.table('guild_settings').get(guildID)
                ).then(res => {
                    if (!bot.settings.guilds.get(guildID)) {
                        bot.settings.guilds.add(res);
                    } else {
                        bot.settings.guilds.remove(res);
                        bot.settings.guilds.add(res);
                    }

                    resolve(res);
                }).catch(reject);
            }
        });
    };

    /**
    * Get the settings for a user.
    *
    * @param {String} userID ID of user to get settings for.
    * @returns {Promise<Object>} Settings for the user.
    */
    bot.getUserSettings = userID => {
        return new Promise((resolve, reject) => {
            if (typeof userID !== 'string') {
                reject(new TypeError('userID is not string.'));
            } else {
                if (bot.settings.users.get(userID)) {
                    resolve(bot.settings.users.get(userID));
                } else {
                    bot.db.table('user_settings').get(userID).run().then(res => {
                        if (!res) {
                            return bot.initUserSettings(userID);
                        } else {
                            bot.settings.users.add(res);
                            resolve(res);
                        }
                    }).then(res => {
                        if (res) {
                            resolve(res);
                        } else {
                            return null;
                        }
                    }).catch(reject);
                }
            }
        });
    };

    /**
    * Initialize settings for a user.
    *
    * @param {String} userID ID of user to init settings for.
    * @returns {Promise<Object>} Settings for the user.
    */
    bot.initUserSettings = userID => {
        return new Promise((resolve, reject) => {
            if (typeof userID !== 'string') {
                reject(new TypeError('userID is not string.'));
            } else {
                let settings = {id: userID, locale: 'en-UK'};
                bot.settings.users.add(settings);
                bot.db.table('user_settings').get(userID).run().then(res => {
                    if (res) {
                        return res;
                    } else {
                        return bot.db.table('user_settings').insert(settings).run();
                    }
                }).then(res => {
                    resolve(res);
                }).catch(reject);
            }
        });
    };

    /**
    * Edit a user's settings.
    *
    * @param {String} userID ID of user to edit settings for.
    * @param {Object} settings Settings to change.
    * @returns {Promise<Object>} Updated settings for the user.
    */
    bot.setUserSettings = (userID, settings = {}) => {
        return new Promise((resolve, reject) => {
            if (typeof userID !== 'string') {
                reject(new TypeError('userID is not string.'));
            } else if (Object.keys(settings).length === 0) {
                reject(new Error('No settings.'));
            } else {
                bot.db.table('user_settings').get(userID).update(settings).run().then(() =>
                    bot.db.table('user_settings').get(userID)
                ).then(res => {
                    if (!bot.settings.users.get(userID)) {
                        bot.settings.users.add(res);
                    } else {
                        bot.settings.users.remove(res);
                        bot.settings.users.add(res);
                    }

                    resolve(res);
                }).catch(reject);
            }
        });
    };
    
    /**
     * POST something to Hastebin.
     * 
     * @param {String} str Content to POST.
     * @returns {Promise<String>} Returned key.
     */
    bot.hastePost = str => {
        return new Promise((resolve, reject) => {
            if (typeof str !== 'string') throw new TypeError('str is not a string.');

            got('https://hastebin.com/documents', {
                method: 'POST',
                body: str
            }).then(res => resolve(JSON.parse(res.body).key)).catch(reject);
        });
    };

    /**
     * Check if a user has elevated bot permissions.
     * 
     * @param {String} userID ID of the user to check.
     * @returns {Boolean} If the user has perms.
     */
    bot.checkBotPerms = userID => {
        return userID === bot.config.ownerID || ~bot.admins.indexOf(userID);
    };

    /**
     * Check if a user is blacklisted.
     * 
     * @param {String} userID ID of the user to check.
     * @returns {Boolean} If the user is blacklisted.
     */
    bot.isBlacklisted = userID => {
        return ~bot.blacklist.indexOf(userID);
    };
};