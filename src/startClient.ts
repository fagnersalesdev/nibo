import { Client } from 'discord.js'
import { createClient } from './createClient'
import { niboConfig } from './niboConfig'

export async function startClient(): Promise<Client> {
  const client = createClient()
  await client.login(niboConfig.bot_token)

  niboConfig.afterLogin?.(client)

  return client
}
