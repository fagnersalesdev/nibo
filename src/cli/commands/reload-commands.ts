import { Collection, ContextMenuCommandBuilder, REST, Routes, SlashCommandBuilder } from 'discord.js'
import { join } from 'node:path'
import { readCommands } from '../../readCommands'
import { readConfigFile } from '../../readConfigFile'
import { NiboMessageContextCommandData } from '../../types/NiboMessageContextCommand'
import { NiboSlashCommandData } from '../../types/NiboSlashCommand'

async function loadCommands(props: {
  token: string,
  clientId: string,
  builders: Array<SlashCommandBuilder | ContextMenuCommandBuilder>
}) {
  const rest = new REST({ version: '10' }).setToken(props.token)

  await rest.put(
    Routes.applicationCommands(props.clientId),
    { body: props.builders },
  )
}

export function run(folder: string, extension: '.js' | '.ts') {
  console.log('Reading Commands')
  const config = readConfigFile(folder, extension)

  const slashCommandDatas = new Collection<string, NiboSlashCommandData>()
  const messageCommandDatas = new Collection<string, NiboMessageContextCommandData>()

  readCommands({
    baseFolder: folder,
    extension,
    directoryPath: join(process.cwd(), `${folder}/commands`),
    slashCommandDatas,
    messageCommandDatas
  })

  console.log('Loading Commands...')
  
  loadCommands({
    token: config.bot_token,
    clientId: config.bot_id,
    builders: [
      ...slashCommandDatas,
      ...messageCommandDatas
    ].map(([_key, value]) => value.build)
  })

  
}