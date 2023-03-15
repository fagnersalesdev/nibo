import { Collection } from 'discord.js'
import { z } from 'zod'
import { configSchema } from './types/NiboConfig'
import { NiboMessageContextCommand, NiboMessageContextCommandData } from './types/NiboMessageContextCommand'
import { NiboSlashCommand, NiboSlashCommandData } from './types/NiboSlashCommand'

export class NiboConfig {
  public bot_token!: string
  public bot_id!: string
  public afterLogin: z.infer<typeof configSchema['shape']['afterLogin']>

  slashCommandDatas: Collection<string, NiboSlashCommandData> = new Collection()
  slashCommandFunctions: Collection<string, NiboSlashCommand> = new Collection()

  messageCommandDatas: Collection<string, NiboMessageContextCommandData> = new Collection()
  messageCommandFunctions: Collection<string, NiboMessageContextCommand> = new Collection()
}

export const niboConfig = new NiboConfig()