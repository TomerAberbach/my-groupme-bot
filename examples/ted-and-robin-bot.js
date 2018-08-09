const bot = require('my-groupme-bot')

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
  ).listen(process.env.PORT)
