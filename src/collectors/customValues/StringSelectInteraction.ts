import { StringSelectCollector } from '../structures'
import { CustomValue, CollectorReturnType } from './CustomValue'

export class StringSelectInteraction extends CustomValue {
  public constructor(
    public readonly value: CollectorReturnType<StringSelectCollector>
  ) {
    super()
  }

  public isStringSelectInteraction(): this is StringSelectInteraction {
    return true
  }
}