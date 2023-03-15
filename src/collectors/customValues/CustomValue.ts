import { ButtonSelectInteraction } from './ButtonSelectInteraction'
import { RoleSelectInteraction } from './RoleSelectInteraction'
import { RoleInput } from './RoleInput'
import { TextInput } from './TextInput'
import { AttachmentBufferInput } from './AttachmentBufferInput'
import { ChannelSelectInteraction } from './ChannelSelectInteraction'
import { StringSelectInteraction } from './StringSelectInteraction'
import { ChannelInput } from './ChannelInput'
import { EmojiInput } from './EmojiInput'
import { EmojiGuildInput } from './EmojiGuildInput'
import { MessageReferenceInput } from './MessageReferenceInput'

export type CollectorReturnType<T extends { run: (...args: unknown[]) => unknown }> =
  T extends { run: (...args: unknown[]) => Promise<infer R> }
  ? R
  : never

export class CustomValue {
  public isRoleSelectInteraction(): this is RoleSelectInteraction {
    return false
  }

  public isButtonSelectInteraction(): this is ButtonSelectInteraction {
    return false
  }

  public isTextInput(): this is TextInput {
    return false
  }

  public isRoleInput(): this is RoleInput {
    return false
  }

  public isAttachmentBufferInput(): this is AttachmentBufferInput {
    return false
  }

  public isChannelSelectInteraction(): this is ChannelSelectInteraction {
    return false
  }

  public isStringSelectInteraction(): this is StringSelectInteraction {
    return false
  }

  public isChannelInput(): this is ChannelInput {
    return false
  }

  public isEmojiInput(): this is EmojiInput {
    return false
  }

  public isEmojiGuildInput(): this is EmojiGuildInput {
    return false
  }

  public isMessageReferenceInput(): this is MessageReferenceInput {
    return false
  }
}