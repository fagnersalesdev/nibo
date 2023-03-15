import { NiboConfig } from './niboConfig'
import { watch } from 'node:fs'
import { validateBuilder } from './validateBuilder'
import { ContextMenuCommandBuilder, SlashCommandBuilder } from 'discord.js'
import { NiboSlashCommandData } from './types/NiboSlashCommand'
import { calculateTimeElapsed } from './utils/calculateTimeElapsed'
import { nibopack } from './utils/brand'
import chalk from 'chalk'
import { NiboMessageContextCommandData } from './types/NiboMessageContextCommand'

export async function watchCommands(directoryPath: string, niboConfig: NiboConfig) {

  console.log(`${nibopack} [🔥] Watching "${directoryPath}" (Beta)\n`)

  let recentlyRunned: boolean = false;

  watch(directoryPath, {
    persistent: true,
    recursive: true
  }, (_event, filename) => {
    if (recentlyRunned) return

    recentlyRunned = true

    setTimeout(() => {
      recentlyRunned = false
    }, 1000)
    for (const [_, slashCommandData] of niboConfig.slashCommandDatas) {
      const hotReloadTimeElapsed = calculateTimeElapsed()

      const filePath = slashCommandData.path.replace(/^.*src\\commands/, '')

      if (filename.startsWith(filePath.slice(1))) {
        const buildFileName = `build.ts`
        const commandFileName = `command.ts`
        const directoryFolderName = slashCommandData.path.split('\\').reverse()[1]
        console.log(`\n${nibopack} [🔥] resolving ${chalk.bold.red(directoryFolderName)}`)

        const buildPath = `${slashCommandData.path}${buildFileName}`
        const commandPath = `${slashCommandData.path}${commandFileName}`

        const cachedFiles = Object.keys(require.cache)
          .filter(key => key.startsWith(slashCommandData.path))

        cachedFiles.forEach((key) => delete require.cache[key])

        const build = validateBuilder(buildPath)

        if (build instanceof SlashCommandBuilder) {
          const slashCommandFunction = require(commandPath).default
          niboConfig.slashCommandFunctions.set(build.name, slashCommandFunction)

          const extraConfig = require(buildPath).default as NiboSlashCommandData

          niboConfig.slashCommandDatas.set(build.name, {
            build,
            path: buildPath.replace(buildFileName, ''),
            onRunning: extraConfig.onRunning,
            onRunningAny: extraConfig.onRunningAny,
            timeout: extraConfig.timeout,
          })

          return console.log(`${nibopack} [🔥] Hot Reload took ${chalk.bold.green(`${hotReloadTimeElapsed()}ms`)}\n`)
        }
      }
    }

    for (const [_, messageCommandData] of niboConfig.messageCommandDatas) {
      const hotReloadTimeElapsed = calculateTimeElapsed()

      const filePath = messageCommandData.path.replace(/^.*src\\commands/, '')

      if (filename.startsWith(filePath.slice(1))) {
        const buildFileName = `build.ts`
        const commandFileName = `command.ts`
        const directoryFolderName = messageCommandData.path.split('\\').reverse()[1]
        console.log(`\n${nibopack} [🔥] resolving ${chalk.bold.red(directoryFolderName)}`)

        const buildPath = `${messageCommandData.path}${buildFileName}`
        const commandPath = `${messageCommandData.path}${commandFileName}`

        const cachedFiles = Object.keys(require.cache)
          .filter(key => key.startsWith(messageCommandData.path))

        cachedFiles.forEach((key) => delete require.cache[key])

        const build = validateBuilder(buildPath)

        if (build instanceof ContextMenuCommandBuilder) {
          const messageCommandFunction = require(commandPath).default
          niboConfig.messageCommandFunctions.set(build.name, messageCommandFunction)

          const extraConfig = require(buildPath).default as NiboMessageContextCommandData

          niboConfig.messageCommandDatas.set(build.name, {
            build,
            path: buildPath.replace(buildFileName, ''),
            onRunning: extraConfig.onRunning,
            onRunningAny: extraConfig.onRunningAny,
            timeout: extraConfig.timeout,
          })

          return console.log(`${nibopack} [🔥] Hot Reload took ${chalk.bold.green(`${hotReloadTimeElapsed()}ms`)}\n`)
        }
      }
    }
  })
}