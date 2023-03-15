import { Client, Collection, InteractionReplyOptions, Message, MessagePayload } from 'discord.js'
import { niboConfig } from './niboConfig'

class RunningCommand {
  public message: Message | null = null
  public userId: string
  public guildId: string
  public channelId: string
  public commandName: string

  public constructor(props: {
    userId: string
    guildId: string
    channelId: string
    commandName: string
  }) {
    this.userId = props.userId
    this.guildId = props.guildId
    this.channelId = props.channelId
    this.commandName = props.commandName
  }

  public setMessage(message: Message): this {
    this.message = message
    return this
  }
}

class TimeoutedCommand {
  public userId: string
  public guildId: string
  public channelId: string
  public commandName: string
  public timeout: number
  public timeoutEndsAt: number = 0

  public constructor(props: {
    userId: string
    guildId: string
    channelId: string
    commandName: string
    timeout: number
  }) {
    this.userId = props.userId
    this.guildId = props.guildId
    this.channelId = props.channelId
    this.commandName = props.commandName
    this.timeout = props.timeout
  }

  public start(): void {
    if (this.timeoutEndsAt === 0) this.timeoutEndsAt = Date.now() + this.timeout
  }
}

export async function listenEvents(client: Client<true>): Promise<void> {
  const timeoutedCommands = new Collection<string, TimeoutedCommand>()
  const runningCommands = new Collection<string, RunningCommand>()

  client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand() && !interaction.isMessageContextMenuCommand()) return

    const command = interaction.isChatInputCommand()
      ? niboConfig.slashCommandDatas.get(interaction.commandName)
      : niboConfig.messageCommandDatas.get(interaction.commandName)

    if (!command) {
      interaction.reply({
        content: 'Command not found!'
      })

      return
    }

    const commandKey = `${interaction.user.id}-${interaction.commandName}`

    if (command.onRunning) {
      const runningCommand = runningCommands.get(commandKey)

      if (runningCommand && (command.onRunning || command.onRunningAny)) {
        if (runningCommand.message) {
          command.onRunning?.(interaction as any, { message: runningCommand.message })
        }
        return
      }
    }

    if (command.timeout) {
      const timeoutedCommand = timeoutedCommands.get(commandKey)


      if (timeoutedCommand) {
        command.timeout.on?.(interaction as any, timeoutedCommand.timeoutEndsAt - Date.now())
        return
      }

      timeoutedCommands.set(commandKey, new TimeoutedCommand({
        userId: interaction.user.id,
        channelId: interaction.channelId,
        guildId: interaction.guildId!,
        commandName: interaction.commandName,
        timeout: command.timeout.time
      }))
    }

    const commandFunction = interaction.isChatInputCommand()
      ? niboConfig.slashCommandFunctions.get(interaction.commandName)!
      : niboConfig.messageCommandFunctions.get(interaction.commandName)!

    const createdRunningCommand = new RunningCommand({
      userId: interaction.user.id,
      guildId: interaction.guildId!,
      channelId: interaction.channelId,
      commandName: interaction.commandName,
    })

    const originalInteractionReply = interaction.reply.bind(interaction)

    const mimicInteractionReply = async (
      options: (InteractionReplyOptions & { fetchReply: true; }) | string | MessagePayload | InteractionReplyOptions
    ): Promise<any> => {
      const result = await originalInteractionReply(options)

      if (typeof options === 'object' && 'fetchReply' in options) {
        createdRunningCommand.setMessage(result as any)
      }

      return result
    }

    interaction.reply = mimicInteractionReply

    runningCommands.set(commandKey, createdRunningCommand)
    const commandResult = commandFunction({ interaction } as any)
    if (command.onRunning || command.onRunningAny) await commandResult
    runningCommands.delete(commandKey)

    const createdTimeoutedCommand = timeoutedCommands.get(commandKey)

    if (createdTimeoutedCommand) {
      createdTimeoutedCommand.start()
      setTimeout(() => timeoutedCommands.delete(commandKey), createdTimeoutedCommand.timeout)
    }
  })
}