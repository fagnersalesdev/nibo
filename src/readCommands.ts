import { ApplicationCommandType, Collection, ContextMenuCommandBuilder, SlashCommandBuilder } from 'discord.js'
import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { NiboSlashCommand, NiboSlashCommandData } from './types/NiboSlashCommand'
import { NiboMessageContextCommand, NiboMessageContextCommandData } from './types/NiboMessageContextCommand'
import { validateBuilder } from "./validateBuilder"

export function readCommand(props: {
  directoryPath: string,
  baseFolder: string,
  extension: string,
  filePath: string,

  slashCommandDatas: Collection<string, NiboSlashCommandData>,
  slashCommandFunctions?: Collection<string, NiboSlashCommand>,

  messageCommandDatas: Collection<string, NiboMessageContextCommandData>,
  messageCommandFunctions?: Collection<string, NiboMessageContextCommand>
}) {
  const { filePath } = props

  const commandFileName = `command${props.extension}`
  const buildFileName = `build${props.extension}`

  const build = validateBuilder(filePath)

  if (build instanceof SlashCommandBuilder) {
    const extraConfig = require(filePath).default as NiboSlashCommandData

    if (props.slashCommandFunctions) {
      const slashCommandFunction = require(filePath.replace(buildFileName, commandFileName)).default
      props.slashCommandFunctions.set(build.name, slashCommandFunction)
    }

    props.slashCommandDatas.set(build.name, {
      build,
      path: filePath.replace(buildFileName, ''),
      onRunning: extraConfig.onRunning,
      onRunningAny: extraConfig.onRunningAny,
      timeout: extraConfig.timeout,
    })

    return
  }

  if (build instanceof ContextMenuCommandBuilder) {
    const extraConfig = require(filePath).default as NiboMessageContextCommandData

    if (build.type === ApplicationCommandType.Message) {
      if (props.messageCommandFunctions) {
        const niboMessageCommand = require(filePath.replace(buildFileName, commandFileName)).default
        props.messageCommandFunctions.set(build.name, niboMessageCommand)
      }

      props.messageCommandDatas.set(build.name, {
        build,
        path: filePath.replace(buildFileName, ''),
        onRunning: extraConfig.onRunning,
        onRunningAny: extraConfig.onRunningAny,
        timeout: extraConfig.timeout,
      })
    }

    return
  }
}

export function readCommands(props: {
  directoryPath: string,
  baseFolder: string,
  extension: string,

  slashCommandDatas: Collection<string, NiboSlashCommandData>,
  slashCommandFunctions?: Collection<string, NiboSlashCommand>,

  messageCommandDatas: Collection<string, NiboMessageContextCommandData>,
  messageCommandFunctions?: Collection<string, NiboMessageContextCommand>
}) {
  const fileNames = readdirSync(props.directoryPath)

  for (const fileName of fileNames) {
    const filePath = join(props.directoryPath, fileName)
    const isNotFile = !statSync(filePath).isFile()

    if (isNotFile) {
      readCommands({ ...props, directoryPath: filePath })
      continue
    }

    if (fileName === `build${props.extension}`) readCommand({ ...props, filePath })
  }
}
