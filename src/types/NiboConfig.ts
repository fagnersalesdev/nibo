import { Client } from 'discord.js'
import { z } from 'zod'

const botToken = z.string({
  required_error: 'Missing "bot_token" property in configuration file.',
  description: 'The token for initializing the bot'
})

const botId = z.string({
  required_error: 'Missing "bot_id" property in configuration file.',
  description: 'The bot id that will be initialized'
})

const afterLogin = z.function()
  .args(
    z.custom<Client>(data => data instanceof Client)
  )
  .returns(
    z.void().or(z.promise(z.void()))
  )

export const configSchema = z.object({
  bot_token: botToken,
  bot_id: botId,
  afterLogin: afterLogin.optional()
}, { required_error: 'Missing export of object with property "config" with the configuration content' })

export type NiboConfig = z.infer<typeof configSchema>