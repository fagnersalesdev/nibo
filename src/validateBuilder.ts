import { ApplicationCommandType, ContextMenuCommandBuilder, SlashCommandBuilder } from 'discord.js'
import { NiboSlashCommandBuilder } from './types/NiboSlashCommand'
import { NiboMessageContextCommandBuilder } from './types/NiboMessageContextCommand'

const slashCommand = (data: any): data is NiboSlashCommandBuilder => true
const messageContextCommand = (data: any): data is NiboMessageContextCommandBuilder => true

export function validateBuilder(path: string): SlashCommandBuilder | ContextMenuCommandBuilder {
  const builderData = require(path).default

  if (builderData.isSlashCommand && slashCommand(builderData)) {
    const builder = new SlashCommandBuilder()
      .setName(builderData.name)
      .setDescription(builderData.description)
      .setDefaultMemberPermissions(builderData.defaultMemberPermissionNeeded)

    if (builderData.options) builderData.options.forEach(option => builder.options.push(option))

    return builder
  }

  if (builderData.isMessageContext && messageContextCommand(builderData)) {
    const builder = new ContextMenuCommandBuilder()
      .setType(ApplicationCommandType.Message)
      .setName(builderData.name)
      .setDefaultMemberPermissions(builderData.defaultMemberPermissionNeeded)

    return builder
  }

  throw new Error('unknown builder type')
}