import { ButtonSelectCollector } from '../structures'
import { CustomValue, CollectorReturnType } from './CustomValue'

export class ButtonSelectInteraction extends CustomValue {
  public constructor(
    public readonly value: CollectorReturnType<ButtonSelectCollector>
  ) {
    super()
  }

  public isButtonSelectInteraction(): this is ButtonSelectInteraction {
    return true
  }
}