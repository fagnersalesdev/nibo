import {
  ChatInputCommandInteraction,
  ContextMenuCommandInteraction,
  SlashCommandBuilder,
  Message
} from 'discord.js'

export type OnRunningWhere = {
  message: Message
}

type Interaction =
  | ChatInputCommandInteraction
  | ContextMenuCommandInteraction

export type OnTimeout<T extends Interaction> = (interaction: T, timeLeftInMilliseconds: number) => void | Promise<void>
export type OnRunning<T extends Interaction> = (interaction: T, where: OnRunningWhere) => void | Promise<void>
export type OnRunningAny<T extends Interaction> = (interaction: T) => void | Promise<void>
export type DefaultMemberPermissionNeeded = Parameters<SlashCommandBuilder['setDefaultMemberPermissions']>[0]

export type NiboCommandBuilder<T extends Interaction> = {
  name: string
  onRunning?: OnRunning<T>
  onRunningAny?: OnRunningAny<T>
  defaultMemberPermissionNeeded?: DefaultMemberPermissionNeeded
  timeout?: {
    time: number
    on?: OnTimeout<T>
  }
}

export type NiboCommandData<T extends Interaction> = {
  path: string

  timeout?: {
    time: number
    on?: OnTimeout<T>
  }

  /* When the user is already running this command */
  onRunning?: OnRunning<T>

  /* When the user is running a command somewhere */
  onRunningAny?: OnRunningAny<T>
}