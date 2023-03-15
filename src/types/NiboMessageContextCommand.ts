import { ContextMenuCommandBuilder, MessageContextMenuCommandInteraction } from 'discord.js'
import { NiboCommandBuilder, NiboCommandData } from './NiboCommand'

export type NiboMessageContextCommandProps = {
  interaction: MessageContextMenuCommandInteraction
}

export type NiboMessageContextCommand = (props: NiboMessageContextCommandProps) => Promise<void>

export type NiboMessageContextCommandBuilder =
  NiboCommandBuilder<MessageContextMenuCommandInteraction> & {
    isMessageContext: true
  }

export type NiboMessageContextCommandData =
  NiboCommandData<MessageContextMenuCommandInteraction> & {
    build: ContextMenuCommandBuilder
  }