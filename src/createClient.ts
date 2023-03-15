import { Client, IntentsBitField, Partials } from 'discord.js'

export const createClient = () => {
  const client = new Client({
    intents: [
      IntentsBitField.Flags.Guilds,
      IntentsBitField.Flags.GuildInvites,
      IntentsBitField.Flags.GuildMembers,
      IntentsBitField.Flags.GuildMessages,
      IntentsBitField.Flags.MessageContent,
      IntentsBitField.Flags.GuildMessageReactions,
    ],
    allowedMentions: {
      parse: ['users']
    },
    partials: [Partials.Channel]
  })

  return client
}