import { ChatInputCommandInteraction, TextChannel, Message, ButtonInteraction, MessageContextMenuCommandInteraction } from 'discord.js'

import {
  ChannelSelectCollector, ChannelSelectCollectorProps,
  RoleSelectCollector, RoleSelectCollectorProps,
  ButtonSelectCollector, ButtonSelectCollectorProps, StringSelectCollectorProps, StringSelectCollector
} from '../collectors/structures'

type Interaction = ChatInputCommandInteraction | MessageContextMenuCommandInteraction | ButtonInteraction

const interactionToProps = (interaction: Interaction) => ({
  location: interaction.channel as TextChannel,
  target: interaction.user
})

const buttonSelectHook = (
  interaction: Interaction,
  props: ButtonSelectCollectorProps
) => {
  return new ButtonSelectCollector(interactionToProps(interaction)).setProps(props).run()
}

const roleSelectHook = (
  interaction: Interaction,
  props: RoleSelectCollectorProps
) => {
  return new RoleSelectCollector(interactionToProps(interaction)).setProps(props).run()
}

const channelSelectHook = (
  interaction: Interaction,
  props: ChannelSelectCollectorProps
) => {
  return new ChannelSelectCollector(interactionToProps(interaction)).setProps(props).run()
}

const stringSelectHook = (
  interaction: Interaction,
  props: StringSelectCollectorProps
) => {
  return new StringSelectCollector(interactionToProps(interaction)).setProps(props).run()
}

export function createSelectHooks(interaction: Interaction) {
  let message: Message

  return {
    useButton: (props?: ButtonSelectCollectorProps) => buttonSelectHook(interaction, { message, ...props }),
    useRole: (props?: RoleSelectCollectorProps) => roleSelectHook(interaction, { message, ...props }),
    useChannel: (props?: ChannelSelectCollectorProps) => channelSelectHook(interaction, { message, ...props }),
    useString: (props?: StringSelectCollectorProps) => stringSelectHook(interaction, { message, ...props }),

    createUseButton: () => new ButtonSelectCollector(interactionToProps(interaction)),
    createUseRole: () => new RoleSelectCollector(interactionToProps(interaction)),
    createUseChannel: () => new ChannelSelectCollector(interactionToProps(interaction)),
    createUseString: () => new StringSelectCollector(interactionToProps(interaction)),

    setMessage(newMessage: Message) {
      message = newMessage
      return this
    }
  }
}