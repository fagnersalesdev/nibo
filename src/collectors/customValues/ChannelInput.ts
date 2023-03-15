import { ChannelInputCollector } from '../structures'
import { CustomValue, CollectorReturnType } from './CustomValue'

export class ChannelInput extends CustomValue {
  public constructor(
    public readonly value: CollectorReturnType<ChannelInputCollector>
  ) {
    super()
  }

  public isChannelInput(): this is ChannelInput {
    return true
  }
}