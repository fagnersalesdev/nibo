import { Message, Role } from 'discord.js'
import { Collector } from './Collector'
import { MessageCollector } from './MessageCollector'

export const RoleInputCollectorOnFailedReasons = {
  NoRole: 'NoRole',
  Unknown: 'Unknown'
} as const

export interface RoleInputCollectorProps {
  // TODO: add a property for limit role permissions
  silent?: boolean,
  onFailedFilter?: (collector: MessageCollector, message: Message, reason: keyof typeof RoleInputCollectorOnFailedReasons) => void
}

export class RoleInputCollector extends Collector<RoleInputCollectorProps> {
  private collector!: MessageCollector

  public stop(): void {
    this.collector.stop()
  }

  public async run(): Promise<Role | null> {
    this.collector = new MessageCollector(this)

    const collectedMessage = await this.collector
      .setProps({
        ...this.props,
        filter,
        onFailedFilter: (collector, message) => {
          if (!this.props.onFailedFilter) defaultOnFailedFilter.call(this, collector, message)
          else if (!hasRole(message)) this.props.onFailedFilter(collector, message, RoleInputCollectorOnFailedReasons.NoRole)
          else this.props.onFailedFilter(collector, message, RoleInputCollectorOnFailedReasons.Unknown)
        }
      })
      .run()

    return collectedMessage?.mentions.roles.first() || collectedMessage?.guild?.roles.cache.find(compareRoleWithContent(collectedMessage.content)) || null

    async function defaultOnFailedFilter(collector: MessageCollector, message: Message): Promise<void> {
      const replyAndPushToMessageStack = async (content: string): Promise<void> =>
        collector.pushMessageToMessageStack(await message.reply(content))

      replyAndPushToMessageStack('Você precisa informar um cargo.')
    }

    function hasRole(message: Message): boolean {
      return message.mentions.roles.size > 0 || !!message.guild?.roles.cache.some(compareRoleWithContent(message.content))
    }

    async function filter(message: Message): Promise<boolean> {
      return hasRole(message)
    }

    function compareRoleWithContent(content: string) {
      return (role: Role): boolean => (
        role.id === content.replace(/\D/g, '') ||
        role.name.toLowerCase() === content.toLowerCase()
      )
    }
  }
}