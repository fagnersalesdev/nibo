import { EmojiGuildInputCollector } from '../structures'
import { CustomValue, CollectorReturnType } from './CustomValue'

export class EmojiGuildInput extends CustomValue {
  public constructor(
    public readonly value: CollectorReturnType<EmojiGuildInputCollector>
  ) {
    super()
  }

  public isEmojiGuildInput(): this is EmojiGuildInput {
    return true
  }
}