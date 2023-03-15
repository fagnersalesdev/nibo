import { TextInputCollector } from '../structures/TextInputCollector'
import { CustomValue, CollectorReturnType } from './CustomValue'

export class TextInput extends CustomValue {
  public constructor(
    public readonly value: CollectorReturnType<TextInputCollector>
  ) {
    super()
  }

  public isTextInput(): this is TextInput {
    return true
  }
}