import { ChatInputCommandInteraction, SlashCommandBuilder, ToAPIApplicationCommandOptions } from 'discord.js'
import { NiboCommandBuilder, NiboCommandData } from './NiboCommand'

export type NiboSlashCommandProps = {
  interaction: ChatInputCommandInteraction
}

export type NiboSlashCommand = (props: NiboSlashCommandProps) => Promise<void>

export type NiboSlashCommandBuilder =
  NiboCommandBuilder<ChatInputCommandInteraction> & {
    isSlashCommand: true
    description: string
    options?: ToAPIApplicationCommandOptions[]
  }

export type NiboSlashCommandData =
  NiboCommandData<ChatInputCommandInteraction> & {
    build: SlashCommandBuilder
  }