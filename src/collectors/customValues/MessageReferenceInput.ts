import { CollectorReturnType, CustomValue } from './CustomValue'
import { MessageReferenceInputCollector } from '../structures/MessageReferenceInputCollector'

export class MessageReferenceInput extends CustomValue {
  public constructor(
    public readonly value: CollectorReturnType<MessageReferenceInputCollector>
  ) {
    super()
  }

  public isMessageReferenceInput(): this is MessageReferenceInput {
    return true
  }
}