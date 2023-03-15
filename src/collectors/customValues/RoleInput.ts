import { CollectorReturnType, CustomValue } from './CustomValue'
import { RoleInputCollector } from '../structures/RoleInputCollector'

export class RoleInput extends CustomValue {
  public constructor(
    public readonly value: CollectorReturnType<RoleInputCollector>
  ) {
    super()
  }

  public isRoleInput(): this is RoleInput {
    return true
  }
}