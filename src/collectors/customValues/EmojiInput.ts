import { EmojiInputCollector } from '../structures'
import { CustomValue, CollectorReturnType } from './CustomValue'

export class EmojiInput extends CustomValue {
  public constructor(
    public readonly value: CollectorReturnType<EmojiInputCollector>
  ) {
    super()
  }

  public isEmojiInput(): this is EmojiInput {
    return true
  }
}