const bot = require('my-groupme-bot')

bot.config('YOUR_BOT_ID')
  .every(1, 'minute', () => bot.send('I\'m pretty great.'))
  .listen(process.env.PORT)
