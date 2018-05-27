/**
 * A simple GroupMe bot building and hosting module.
 * @module my-groupme-bot
 * @see module:my-groupme-bot
 */

/**
 * A GroupMe message object.<br/>
 * Go to the <a href="https://dev.groupme.com/tutorials/bots">GroupMe website</a> for more information.
 * @typedef {Object} Message
 * @property {Array} attachments - Array of URLs attached to the message.
 * @property {string} avatar_url - Avatar URL of the user which sent the message.
 * @property {number} created_at - Number indicating when the message was sent.
 * @property {string} group_id - ID of the group where the message was sent.
 * @property {string} id - ID of the message.
 * @property {string} name - Name of the user which sent the message.
 * @property {string} sender_id
 * @property {string} sender_type - Will always be user (bot does not respond to other bots).
 * @property {string} source_guid
 * @property {boolean} system
 * @property {string} text - Actual text of the message.
 * @property {string} user_id - ID of the user which sent the message.
 */

const http = require('http'),
      request = require('request'),
      schedule = require('node-schedule');

const units = {
    millisecond : 1,
    milliseconds : 1,
    millisec : 1,
    millisecs : 1,
    ms : 1,

    second : 1000,
    seconds : 1000,
    sec : 1000,
    secs : 1000,
    s : 1000,

    minute : 60000,
    minutes : 60000,
    min : 60000,
    mins : 60000,
    m : 60000,

    hour : 3600000,
    hours : 3600000,
    h : 3600000,

    day : 86400000,
    days : 86400000,
    d : 86400000
};

let botId;
const features = [];

const server = http.createServer((req, res) => {
    const chunks = [];

    req.on('data', chunk => chunks.push(chunk)).on('end', () => {
        if (req.method === 'POST') {
            res.writeHead(200);
            res.end('OK');

            const message = JSON.parse(chunks.join(''));

            if (message['sender_type'] === 'user') {
                features
                    .filter(feature => feature.check && feature.check(message))
                    .forEach(feature => feature.respond(message));
            }
        } else {
            res.writeHead(400);
            res.end('Invalid request method!');
        }
    });
});

function quote(str) {
    return str.replace(/[.?*+^$[\]\\(){}|-]/g, '\\$&');
}


/**
 * Configures the module with the ID of the bot.<br/>
 * Returns the module itself to allow for builder pattern.
 * @param {string} id - The GroupMe ID of the bot.
 * @returns {*}
 */
module.exports.config = id => {
    botId = id;
    return module.exports;
};

/**
 * A callback which receives the potential error result of sending a GroupMe bot message.
 * @callback send
 * @param {Error} [err] - Error object indicating why the message could not be sent or undefined if it sent successfully.
 */

/**
 * Sends a message as the bot to its GroupMe chat.
 * @param {string} message - A message to send as the bot to its GroupMe chat.
 * @param {string} [imageUrl] - An image URL to send as an attachment with the bot's message.
 * @param {send} [cb] - A callback which receives the potential error result of sending a GroupMe bot message.
 */
module.exports.send = (message, imageUrl, cb) => {
    const params = {
        bot_id : botId,
        text : message.trim()
    };

    if (typeof imageUrl === 'string') {
        params.picture_url = imageUrl;
    } else if (typeof cb === 'undefined') {
        cb = imageUrl;
    }

    request({
        url : 'https://api.groupme.com/v3/bots/post',
        method : 'POST',
        qs : params
    }, (err, res, body) => {
        if (cb) {
            if (err) {
                cb(err);
            } else if (res.statusCode === 202) {
                cb();
            } else {
                cb(new Error(body));
            }
        }
    });
};

/**
 * A callback which checks if a message should be responded to by the bot.
 * @callback check
 * @param {Message} message - The message which was sent by a user.
 * @returns {boolean}
 */

/**
 * A callback which uses the bot to respond to a message.
 * @callback respond
 * @param {Message} message - The message which was sent by a user.
 */

/**
 * Adds a feature to the bot.<br/>
 * Returns the module itself to allow for builder pattern.
 * @param {string} [desc] - A description of the feature to be added.
 * @param {check} check - A callback which checks if a message should be responded to by the bot.
 * @param {respond} respond - A callback which uses the bot to respond to a message and which is only called if 'check' returned true.
 * @returns {*}
 */
module.exports.feature = (desc, check, respond) => {
    if (typeof respond === 'undefined') {
        respond = check;
        check = desc;
        desc = '';
    }

    features.push({
        desc : desc,
        check : check,
        respond : respond
    });

    return module.exports;
};

/**
 * A callback which uses the bot to respond to a message and pattern matches in it.
 * @callback patternRespond
 * @param {Message} message - The message which was sent by a user.
 * @param {RegExpMatchArray} - An array of the pattern matches in the message sent by the user.
 */

/**
 * Adds a regular expression pattern or literal string for the bot to look for in messages and respond to.<br/>
 * Returns the module itself to allow for builder pattern.
 * @param {string} [desc] - A description of the feature to be added.
 * @param {RegExp|string} pattern - A regular expression pattern or literal string for the bot to look for in messages.
 * @param {patternRespond} respond - A callback which uses the bot to respond to a message if the pattern matches in it.
 * @returns {*}
 */
module.exports.pattern = (desc, pattern, respond) => {
    if (typeof respond === 'undefined') {
        respond = pattern;
        pattern = desc;
        desc = '';
    }

    if (typeof pattern === 'string') {
        pattern = new RegExp(quote(pattern), 'g');
    }

    return module.exports.feature(
        desc,
        message => pattern.test(message['text']),
        message => respond(message, message['text'].match(pattern))
    );
};

/**
 * A callback which uses the bot to respond to a user command message.
 * @callback commandRespond
 * @param {Message} message - The message which was sent by a user.
 * @param {string[]} - An array of the whitespace separated arguments provided by user after the command.
 */

/**
 * Adds a command in the form of '/<commandname> [arguments]' for the bot to look for in messages and respond to.<br/>
 * Returns the module itself to allow for builder pattern.
 * @param {string} name - A name for the command which will be called as follows: '/name'.
 * @param {string} [desc] - A description of the command to be added.
 * @param {commandRespond} respond - A callback which uses the bot to respond to a user command message.
 * @returns {*}
 */
module.exports.command = (name, desc, respond) => {
    if (typeof respond === 'undefined') {
        respond = desc;
        desc = '';
    } else {
        desc = ` - ${desc.trim()}`
    }

    const regex = new RegExp(`^/${quote(name)}(\\s|$)`, 'g');

    return module.exports.pattern(
        `/${name}${desc}`,
        regex,
        message => respond(message, message['text'].replace(regex, '').trim().split(/\s+/g))
    );
};

/**
 * A callback which supplies a message for the bot to send.
 * @callback stringSupplier
 * @returns {string}
 */

/**
 * Adds a command in the form of '/<commandname> [arguments]' for the bot to look for in messages and respond to.<br/>
 * Great for querying random quotes or frequently changing input.<br/>
 * Returns the module itself to allow for builder pattern.
 * @param {string} name - A name for the command which will be called as follows: '/name'.
 * @param {string} [desc] - A description of the command to be added.
 * @param {string[]|stringSupplier} supply - A string array to randomly pick a string from or a string supplier to get a string from for the bot to send.
 * @returns {*}
 */
module.exports.random = (name, desc, supply) => {
    if (typeof supply === 'undefined') {
        supply = desc;
        desc = undefined;
    }

    return module.exports.command(
        name, desc,
        () => module.exports.send(Array.isArray(supply) ? supply[Math.floor(Math.random() * supply.length)] : supply())
    );
};

/**
 * A callback which performs a task.
 * @callback task
 */

/**
 * Adds a scheduled task to the bot.<br/>
 * Returns the module itself to allow for builder pattern.
 * @param {string} [desc] - A description of the scheduled task to be added.
 * @param {string|Date} when - A crontab instruction string or Date object representing when to run the task.
 * @param {task} task - A callback which performs a task which is called at the scheduled times.
 * @returns {*}
 */
module.exports.schedule = (desc, when, task) => {
    if (typeof task === 'undefined') {
        task = when;
        when = desc;
    } else {
        features.push({ desc : desc });
    }

    schedule.scheduleJob(when, task);
    return module.exports;
};

/**
 * Adds a task performed on an interval to the bot.<br/>
 * Returns the module itself to allow for builder pattern.
 * @param {string} [desc] - A description of the task performed on an interval to be added.
 * @param {int} interval - A positive integer representing the number of 'unit' between calling 'task'.
 * @param {string} unit - A time unit of measurement (millisecond, milliseconds, millisec, millisecs, ms, second, seconds, sec, secs, s, minute, minutes, min, mins, m, hour, hours, h, day, days, d).
 * @param {task} task - A callback which performs a task which is called every 'interval' 'unit'.
 */
module.exports.every = (desc, interval, unit, task) => {
    if (typeof task === 'undefined') {
        task = unit;
        unit = interval;
        interval = desc;
    } else {
        features.push({ desc : desc });
    }

    if (units[unit]) {
        setInterval(() => task(), units[unit] * interval);
    } else {
        console.log(`Invalid unit '${unit}'. Valid units: ${Object.keys(units)}.`);
    }

    return module.exports;
};

/**
 * Adds a '/help' command which displays all of the bot's commands and its other described features.<br/>
 * Returns the module itself to allow for builder pattern.
 * @returns {*}
 */
module.exports.help = () => module.exports.command(
    'help',
    'Displays help information about the bot.',
    () => module.exports.send(features.map(feature => feature.desc).filter(desc => desc !== '').join('\n'))
);

/**
 * @param args - Arguments, such as a simple port number, passed to the 'listen' function of the 'Server' provided by 'http.createServer'.
 */
module.exports.listen = args => {
    features.sort((a, b) => a.desc < b.desc ? -1 : a.desc > b.desc ? 1 : 0);
    server.listen(args);
};