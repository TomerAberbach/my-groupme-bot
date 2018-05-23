const bot = require('my-groupme-bot');

bot.config('YOUR_BOT_ID')
    .pattern(
        /(i'?m|i\s+am)\s+[^.?!]*[.?!]?/gi,
        (message, matches) => bot.send(matches.map(match =>
            `Hi ${match.trim().replace(/^(i'?m|i\s+am)\s+/gi, '')}, I'm dad!`
        ).join('\n'))
    ).listen(process.env.PORT);