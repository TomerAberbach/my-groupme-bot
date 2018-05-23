# My GroupMe Bot
A simple GroupMe bot building and hosting module.

## Examples

### Dad Bot
The bot, inspired by dads everywhere, takes any declarations about yourself very literally.

Example:
```
User: I'm feeling great today
Bot: Hi feeling great today, I'm dad!
```
Code:
```javascript
const bot = require('my-groupme-bot');

bot.config('YOUR_BOT_ID')
    .pattern(
        /(i'?m|i\s+am)\s+[^.?!]*[.?!]?/gi,
        (message, matches) => bot.send(matches.map(match =>
            `Hi ${match.trim().replace(/^(i'?m|i\s+am)\s+/gi, '')}, I'm dad!`
        ).join('\n'))
    ).listen(process.env.PORT);
```

### Ted and Robin Bot
The bot, inpired by How I Met Your Mother, salutes any army, navy, etc. officer mentioned in a chat!

Example:
```
User: Well yeah, that's the general idea
Bot: *salutes* general idea
```
Code:
```javascript
const bot = require('my-groupme-bot');

bot.config('YOUR_BOT_ID')
    .pattern(new RegExp(`(${[
        'general',
        'private',
        'corporal',
        'lieutenant',
        'major',
        'captain',
        'admiral',
        'colonel',
        'kernel',
        'sergeant',
        'specialist',
        'marine',
        'officer'
    ].join('|')})[^.]*\\.?`, 'gi'),
        (message, matches) => bot.send(matches.map(match => `*salutes* ${match.trim()}`).join('\n'))
    ).listen(process.env.PORT);
```

Documentation for the all the functions can be found [here](http://tomeraberbach.com/my-groupme-bot/module-my-groupme-bot.html) and some more examples can be found in the 'examples' folder.
