exports.commands = [
    // Define the name of your commands here.
    'ping',
    'pong'
];

// Example ping command
exports.ping = {
    desc: '', // Mandatory - Description displayed in the main help command.
    longDesc: '', // Optional - Description used in 'help [command name]'. If not supplied, default description will be used
    usage: '', // Optional - Displayed in the help command. Describes any arguments the command accepts if any. Format: <required argument> [optional argument]
    main: function(bot, ctx) { // Mandatory - The actual command process.
    // 'bot' is the Discord.JS Client object. Is extended with 'config' which is the bot configuration file, and 'data' which contains the blacklist and adminlist.
    // 'ctx' is a context object. Contains: 'msg' - A Discord.JS Message object; 'args' - An array where each value is a string, EG: if the command message was 'help ping', args[0] would be 'ping'; 'suffix' - The same as args, but instead of an array, is a string of all the args together, seperated with spaces.
        ctx.msg.channel,sendMessage('Ping!');
    }
}

// Example pong command (demonstrating a full command, and multiple commands in a file).
exports.pong = {
    desc: 'Ping!',
    longDesc: 'Simple response command.',
    main: function(bot, ctx) {
        ctx.msg.channel.sendMessage('Pong!');
    }
}