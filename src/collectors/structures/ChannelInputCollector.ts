import { ChannelType, Guild, GuildBasedChannel, Message } from 'discord.js'
import { Collector } from './Collector'
import { MessageCollector } from './MessageCollector'

export const ChannelInputCollectorOnFailedReasons = {
  NoChannel: 'NoChannel',
  UnavailableChannelType: 'UnavailableChannelType',
  Unknown: 'Unknown'
} as const

type KeyChannelInputCollectorOnFailedReasons = keyof typeof ChannelInputCollectorOnFailedReasons

export interface ChannelInputCollectorProps {
  channelTypes: ChannelType[],
  silent?: boolean,
  onFailedFilter?: (collector: MessageCollector, message: Message, reason: KeyChannelInputCollectorOnFailedReasons) => void
}

export class ChannelInputCollector extends Collector<ChannelInputCollectorProps> {
  private collector!: MessageCollector

  public stop(): void {
    this.collector.stop()
  }

  public async run(): Promise<GuildBasedChannel | null> {
    this.collector = new MessageCollector(this)

    const collectedMessage = await this.collector
      .setProps({
        ...this.props,
        filter,
        onFailedFilter: (collector, message) => {
          const callFailed = (reason: KeyChannelInputCollectorOnFailedReasons) => !!this.props.onFailedFilter
            ? this.props.onFailedFilter(collector, message, reason)
            : defaultOnFailedFilter(collector, message, reason)

          if (!hasChannel(message)) return callFailed(ChannelInputCollectorOnFailedReasons.NoChannel)

          const channel = findChannelInGuildFromContent(message)

          if (channel && this.props.channelTypes.includes(channel.type)) {
            return callFailed(ChannelInputCollectorOnFailedReasons.UnavailableChannelType)
          }

          return callFailed(ChannelInputCollectorOnFailedReasons.Unknown)
        }
      })
      .run()

    const channel = collectedMessage?.mentions.channels.first() || collectedMessage?.guild?.channels.cache.find(compareChannelWithContent(collectedMessage.content)) || null

    if (channel?.type === ChannelType.DM) throw new Error('A DM Channel has passed the filter (should not be able to)')
    if (channel?.type === ChannelType.GroupDM) throw new Error('A GroupDM Channel has passed the filter (should not be able to)')

    return channel
  }
}

async function defaultOnFailedFilter(collector: MessageCollector, message: Message, reason: KeyChannelInputCollectorOnFailedReasons): Promise<void> {
  const replyAndPushToMessageStack = async (content: string): Promise<void> =>
    collector.pushMessageToMessageStack(await message.reply(content))

  switch (reason) {
    case ChannelInputCollectorOnFailedReasons.NoChannel: return replyAndPushToMessageStack('Você precisa informar um canal, mencionando-o ou inserido o ID.')
    case ChannelInputCollectorOnFailedReasons.UnavailableChannelType: return replyAndPushToMessageStack('O canal inserido não é de uo tipo válido.')

    case ChannelInputCollectorOnFailedReasons.Unknown:
    default: return replyAndPushToMessageStack('Um eror desconhecido aconteceu!')
  }
}

function findChannelInGuildFromContent(message: Message): GuildBasedChannel | undefined {
  return message.guild?.channels.cache.find(compareChannelWithContent(message.content))
}

function hasChannel(message: Message): boolean {
  return message.mentions.channels.size > 0 || !!message.guild?.channels.cache.some(compareChannelWithContent(message.content))
}

async function filter(message: Message): Promise<boolean> {
  return hasChannel(message)
}

function compareChannelWithContent(content: string) {
  return (channel: GuildBasedChannel): boolean => (
    channel.id === content.replace(/\D/g, '') ||
    channel.name.toLowerCase() === content.toLowerCase()
  )
}
