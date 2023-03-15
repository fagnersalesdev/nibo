import { AttachmentBufferInputCollector } from '../structures/AttachmentBufferInputCollector'
import { CustomValue, CollectorReturnType } from './CustomValue'

export class AttachmentBufferInput extends CustomValue {
  public constructor(
      public readonly value: CollectorReturnType<AttachmentBufferInputCollector>
    ) {
    super()
  }

  public isAttachmentBufferInput(): this is AttachmentBufferInput {
    return true
  }
}