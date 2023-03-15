import { ChannelSelectCollector } from '../structures'
import { CustomValue, CollectorReturnType } from './CustomValue'

export class ChannelSelectInteraction extends CustomValue {
  public constructor(
    public readonly value: CollectorReturnType<ChannelSelectCollector>
  ) {
    super()
  }

  public isChannelSelectInteraction(): this is ChannelSelectInteraction {
    return true
  }
}