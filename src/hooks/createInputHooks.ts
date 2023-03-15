import { ButtonInteraction, ChatInputCommandInteraction, MessageContextMenuCommandInteraction, TextChannel } from 'discord.js'
import {
  TextInputCollector, TextInputCollectorProps,
  RoleInputCollector,
  AttachmentBufferInputCollector,
  RoleInputCollectorProps,
  AttachmentBufferInputCollectorProps,
  CombineCollectors,
  CombinableCollectors,
  ChannelInputCollector,
  ChannelInputCollectorProps,
  EmojiInputCollector,
  EmojiInputCollectorProps,
  EmojiGuildInputCollector,
  EmojiGuildInputCollectorProps,
  MessageReferenceInputCollectorProps,
  MessageReferenceInputCollector
} from '../collectors/structures'

type Interaction = ChatInputCommandInteraction | MessageContextMenuCommandInteraction | ButtonInteraction

const interactionToProps = (interaction: Interaction) => ({
  location: interaction.channel as TextChannel,
  target: interaction.user
})

const textInputHook = (
  interaction: Interaction,
  props?: TextInputCollectorProps
): Promise<string | null> => {
  return new TextInputCollector(interactionToProps(interaction)).setProps(props).run()
}

const roleInputHook = (
  interaction: Interaction,
  props?: RoleInputCollectorProps
) => {
  return new RoleInputCollector(interactionToProps(interaction)).setProps(props).run()
}

const attachmentBufferInputHook = (
  interaction: Interaction,
  props?: AttachmentBufferInputCollectorProps
) => {
  return new AttachmentBufferInputCollector(interactionToProps(interaction)).setProps(props).run()
}

const channelInputHook = (
  interaction: Interaction,
  props?: ChannelInputCollectorProps
) => {
  return new ChannelInputCollector(interactionToProps(interaction)).setProps(props).run()
}

const emojiInputHook = (
  interaction: Interaction,
  props?: EmojiInputCollectorProps
) => {
  return new EmojiInputCollector(interactionToProps(interaction)).setProps(props).run()
}

const emojiGuildInputHook = (
  interaction: Interaction,
  props?: EmojiGuildInputCollectorProps
) => {
  return new EmojiGuildInputCollector(interactionToProps(interaction)).setProps(props).run()
}

const messageReferenceInputHook = (
  interaction: Interaction,
  props?: MessageReferenceInputCollectorProps
) => {
  return new MessageReferenceInputCollector(interactionToProps(interaction)).setProps(props).run()
}

export const createInputHooks = (interaction: Interaction) => {
  return {
    useText: (props?: TextInputCollectorProps) => textInputHook(interaction, props),
    useRole: (props?: RoleInputCollectorProps) => roleInputHook(interaction, props),
    useAttachmentBuffer: (props?: AttachmentBufferInputCollectorProps) => attachmentBufferInputHook(interaction, props),
    useChannel: (props?: ChannelInputCollectorProps) => channelInputHook(interaction, props),
    useEmoji: (props?: EmojiInputCollectorProps) => emojiInputHook(interaction, props),
    useEmojiGuild: (props?: EmojiGuildInputCollectorProps) => emojiGuildInputHook(interaction, props),
    useMessageReference: (props?: MessageReferenceInputCollectorProps) => messageReferenceInputHook(interaction, props),

    createUseText: () => new TextInputCollector(interactionToProps(interaction)),
    createUseRole: () => new RoleInputCollector(interactionToProps(interaction)),
    createUseAttachmentBuffer: () => new AttachmentBufferInputCollector(interactionToProps(interaction)),
    createUseChannel: () => new ChannelInputCollector(interactionToProps(interaction)),
    createUseEmoji: () => new EmojiInputCollector(interactionToProps(interaction)),
    createUseEmojiGuild: () => new EmojiGuildInputCollector(interactionToProps(interaction)),
    createUseMessageReference: () => new MessageReferenceInputCollector(interactionToProps(interaction)),

    createCombine: (collectors: CombinableCollectors[]) => new CombineCollectors(collectors)
  }
}