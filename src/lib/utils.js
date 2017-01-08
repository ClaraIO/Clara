const fs = require('fs');
const Eris = require('eris');
const config = require(`${__baseDir}/config.json`);

function msToTime(ms) {
    var time = ms / 1000;
    var seconds = time % 60;
    time /= 60;
    var minutes = time % 60;
    time /= 60;
    var hours = time % 24;
    time /= 24;
    var days = time;

    seconds = Math.floor(seconds);
    minutes = Math.floor(minutes);
    hours = Math.floor(hours);
    days = Math.floor(days);

    seconds.toString().length === 1 ? seconds = '0' + seconds.toString() : seconds = seconds.toString();
    minutes.toString().length === 1 ? minutes = '0' + minutes.toString() : minutes = minutes.toString();
    hours.toString().length === 1 ? hours = '0' + hours.toString() : hours = hours.toString();

    return `${days} days, ${hours}:${minutes}:${seconds}`;
}

function formatUsername(user) {
    return user instanceof Eris.Member ? `${user.nick ? user.nick : user.user.username}#${user.user.discriminator}` : `${user.username}#${user.discriminator}`;
}

function isAdmin(userID) {
    return JSON.parse(fs.readFileSync(`${__baseDir}/data/data.json`)).admins.indexOf(userID) !== -1;
}

function isOwner(userID) {
    return userID === config.ownerID;
}

function isBlacklisted(userID) {
    return JSON.parse(fs.readFileSync(`${__baseDir}/data/data.json`)).blacklist.indexOf(userID) !== -1;
}

exports.msToTime = msToTime;
exports.formatUsername = formatUsername;
exports.isOwner = isOwner;
exports.isAdmin = isAdmin;
exports.isBlacklisted = isBlacklisted;