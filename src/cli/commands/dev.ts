import { join } from 'node:path'
import { listenEvents } from '../../listenEvents'
import { niboConfig } from '../../niboConfig'
import { readCommands } from '../../readCommands'
import { readConfigFile } from '../../readConfigFile'
import { startClient } from '../../startClient'
import { brand } from '../../utils/brand'
import { calculateTimeElapsed } from '../../utils/calculateTimeElapsed'
import { watchCommands } from '../../watchCommands'

export async function run(folder: string, extension: '.js' | '.ts', watchMode: boolean) {
  const config = readConfigFile(folder, extension)

  niboConfig.bot_token = config.bot_token
  niboConfig.bot_id = config.bot_id
  niboConfig.afterLogin = config.afterLogin

  const directoryPath = join(process.cwd(), `${folder}/commands`)

  const readCommandsTimeElapsed = calculateTimeElapsed()

  readCommands({
    extension,
    baseFolder: folder,
    directoryPath,
    messageCommandDatas: niboConfig.messageCommandDatas,
    messageCommandFunctions: niboConfig.messageCommandFunctions,
    slashCommandDatas: niboConfig.slashCommandDatas,
    slashCommandFunctions: niboConfig.slashCommandFunctions,
  })

  console.log(`${brand} took ${readCommandsTimeElapsed()}ms to read commands`)

  if (watchMode) watchCommands(directoryPath, niboConfig)

  const client = await startClient()
  listenEvents(client)
}