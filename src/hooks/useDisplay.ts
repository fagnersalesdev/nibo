import { ButtonInteraction, ChannelSelectMenuInteraction, ChatInputCommandInteraction, EmbedBuilder, Message, MessageContextMenuCommandInteraction, MessageCreateOptions, RoleSelectMenuInteraction, StringSelectMenuInteraction } from 'discord.js'

type MessageOptions = string | {
  content?: string
  embeds?: EmbedBuilder[]
  components?: MessageCreateOptions['components']
} | {
  content: string
} | {
  embeds: EmbedBuilder[]
} | {
  components: MessageCreateOptions['components']
}

type Interaction =
  | ChatInputCommandInteraction
  | ButtonInteraction
  | StringSelectMenuInteraction
  | RoleSelectMenuInteraction
  | ChannelSelectMenuInteraction
  | MessageContextMenuCommandInteraction

export function useDisplay<
  T extends string,
  U extends Record<T, MessageOptions | (() => MessageOptions)>,
  K extends keyof U
>(displays: U, initialInteraction?: Interaction) {
  let state: K
  let definedMessage: Message
  let interaction: Interaction

  if (initialInteraction) interaction = initialInteraction

  const replyOrEdit = async (display: MessageOptions | (() => MessageOptions)) => {
    const _display = typeof display === 'function' ? display() : display
    const data = typeof _display === 'string' ? { content: _display } : _display

    if (interaction.replied) return definedMessage.edit(data)

    if (
      interaction.isChatInputCommand() ||
      interaction.isMessageContextMenuCommand()
    ) {
      definedMessage = await interaction.reply({ ...data, fetchReply: true })
    }

    if (
      interaction.isButton() ||
      interaction.isRoleSelectMenu() ||
      interaction.isStringSelectMenu() ||
      interaction.isChannelSelectMenu()
    ) {
      if (interaction.deferred) {
        definedMessage = await interaction.editReply({ ...data })
      } else {
        definedMessage = await interaction.update({ ...data, fetchReply: true })
      }
    }
  }

  return {
    async show(otherState?: K) {
      if (otherState) state = otherState
      await replyOrEdit(displays[state])
    },

    async update() {
      await replyOrEdit(displays[state])
    },

    setDisplay(newState: K, text: U[K]) {
      displays[newState] = text
      return this
    },

    setState(newState: K) {
      state = newState
      return this
    },

    setMessage(newMessage: Message) {
      definedMessage = newMessage
      return this
    },

    setInteraction(newInteraction: Interaction) {
      interaction = newInteraction
      return this
    },

    get state(): K {
      return state
    },

    get message() {
      return definedMessage
    }
  }
}