const bot = require('my-groupme-bot');

bot.config('YOUR_BOT_ID')
    .random('facts', 'Snake facts!', [
        'Snakes don\'t have eyelids.',
        'Snakes have flexible jaws which allow them to eat prey bigger than their head!',
        `Snakes used in snake charming performances respond to movement, not sound.`,
        'Snakes don’t have eyelids.'
    ]).command('hiss', 'Hissssssss!',
        (message, tokens) => bot.send(tokens.join(' ').replace(/s/gi, 'sss'))
    ).help().listen(process.env.PORT);