/*
 * Clara - Core file
 *
 * Contributed by Capuccino and Ovyerus
 *
 * Licensed under MIT. Copyright (c) 2017 Capuccino, Ovyerus and the repository contributors.
 */

/* eslint-env node */

// Module requies
const Eris = require('eris');
const fs = require('fs');

// Setup stuff
const config = require(`${__dirname}/config.json`);
const bot = new Eris(config.token, {
    autoreconnect: true,
    seedVoiceConnections: true,
    maxShards: config.maxShards || 1,
    defaultImageFormat: 'webp',
    defaultImageSize: 512,
    disableEvents: {
        TYPING_START: true
    }
});

//global stuff

global.utils = require(`${__dirname}/modules/utils`);
global.__baseDir = __dirname;
global.Promise = require('bluebird');
global.logger = new(require(`${__dirname}/modules/Logger`))();
global.localeManager = new (require(`${__dirname}/modules/LocaleManager`))();

Promise.config({
    warnings: {wForgottenReturn: config.promiseWarnings || false},
    longStackTraces: config.promiseWarnings || false
});

exports.bot = bot;

// Create data folder and files if they don't exist
if (!fs.existsSync(`${__dirname}/data/`)) fs.mkdirSync(`${__dirname}/data/`);
if (!fs.existsSync(`${__dirname}/cache/`)) fs.mkdirSync(`${__dirname}/cache/`);
if (!fs.existsSync(`${__dirname}/data/data.json`)) fs.writeFileSync(`${__dirname}/data/data.json`, '{"admins": [], "blacklist": []}');
if (!fs.existsSync(`${__dirname}/data/prefixes.json`)) fs.writeFileSync(`${__dirname}/data/prefixes.json`, '[]');

// Bot object modification
let tmp = JSON.parse(fs.readFileSync(`${__dirname}/data/data.json`));
bot.db = require('rethinkdbdash')(config.rethinkOptions);
bot.commands = new (require(`${__dirname}/modules/CommandHolder`)).CommandHolder(bot);
bot.blacklist = tmp.blacklist;
bot.admins = tmp.admins;
tmp = null;
bot.prefixes = JSON.parse(fs.readFileSync(`${__dirname}/data/prefixes.json`)).concat([config.mainPrefix]);
bot.config = config;
bot.loadCommands = true;
bot.allowCommandUse = false;
bot.music = {
    skips: new Eris.Collection(Object),
    queues: new Eris.Collection(Object),
    connections: bot.voiceConnections,
    streams: new Eris.Collection(Object),
    stopped: []
};
bot.settings = {
    guilds: new Eris.Collection(Object),
    users: new Eris.Collection(Object)
};

// Init events
require(`${__dirname}/events`)(bot);
require(`${__dirname}/modules/botExtensions`)(bot);

bot.connect();