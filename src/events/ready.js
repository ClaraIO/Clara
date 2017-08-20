/**
 * @file Giant ass ready event.
 * @author Capuccino
 * @author Ovyerus
 */

/* eslint-env node */

const fs = require('fs');

module.exports = bot => {
    bot.on('ready', async () => {
        if (bot.loadCommands) {
            try {
                bot.prefixes = bot.prefixes.concat([`<@${bot.user.id}> `, `<@!${bot.user.id}> `]);

                await localeManager.loadLocales();
                logger.info(`Loaded ${Object.keys(localeManager.locales).length} locales.`);
                await (require(`${__baseDir}/modules/commandLoader`)).init(bot);
                logger.info(`Loaded ${bot.commands.length} ${bot.commands.length === 1 ? 'command' : 'commands'}.`);

                let tableList = await bot.db.tableList().run();

                if (!tableList.includes('guild_settings')) {
                    logger.info('Setting up "guild_settings" table in database.');
                    await bot.db.tableCreate('guild_settings').run();
                }

                if (!tableList.includes('user_settings')) {
                    logger.info('Setting up "user_settings" talbe in database.');
                    await bot.db.tableCreate('user_settings').run();
                }

                bot.loadCommands = false;
                bot.allowCommandUse = true;

                let altPrefixes = JSON.parse(fs.readFileSync(`${__baseDir}/data/prefixes.json`));

                logger.info(`${bot.user.username} is connected to Discord and is ready to use.`);
                logger.info(`Main prefix is '${bot.config.mainPrefix}', you can also use @mention.`);
                logger.info(altPrefixes.length > 0 ? `Alternative prefixes: '${altPrefixes.join("', ")}'`: 'No alternative prefixes.');
            } catch(err) {
                logger.error(`Error while starting up:\n${bot.config.debug ? err.stack : err}`);
            }
        } else {
            logger.info('Reconnected to Discord from disconnection.');
        }

        bot.editStatus('online', {
            name: `${bot.config.gameName || `${bot.config.mainPrefix}help for commands!`} | ${bot.guilds.size} ${bot.guilds.size === 1 ? 'server' : 'servers'}`,
            type: bot.config.gameURL ? 1 : 0,
            url: `${bot.config.gameURL || null}`
        });
        await bot.postGuildCount();
    });
};
