import { RoleSelectCollector } from '../structures/RoleSelectCollector'
import { CustomValue, CollectorReturnType } from './CustomValue'

export class RoleSelectInteraction extends CustomValue {
  public constructor(
    public readonly value: CollectorReturnType<RoleSelectCollector>
  ) {
    super()
  }

  public isRoleSelectInteraction(): this is RoleSelectInteraction {
    return true
  }
}