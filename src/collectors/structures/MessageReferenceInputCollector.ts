import { Message } from 'discord.js'
import { Collector } from './Collector'
import { MessageCollector } from './MessageCollector'

export const MessageReferenceInputCollectorOnFailedReasons = {
  NoUrlNeitherReference: 'NoUrlNeitherReference',
  NoContent: 'NoContent',
  Unknown: 'Unknown'
} as const

type KeyMessageReferenceInputCollectorOnFailedReasons = keyof typeof MessageReferenceInputCollectorOnFailedReasons

export interface MessageReferenceInputCollectorProps {
  animatedOnly?: boolean
  onFailedFilter?: (
    collector: MessageCollector,
    message: Message,
    reason: KeyMessageReferenceInputCollectorOnFailedReasons
  ) => void
}

export class MessageReferenceInputCollector extends Collector<MessageReferenceInputCollectorProps> {
  private collector!: MessageCollector

  public stop(): void {
    this.collector.stop()
  }

  public async run(): Promise<Message | null> {
    this.collector = new MessageCollector(this)

    const collectedMessage = await this.collector
      .setProps({
        ...this.props,
        filter,
        onFailedFilter: async (collector, message) => {
          const callFailed = (reason: KeyMessageReferenceInputCollectorOnFailedReasons): void | Promise<void> => !!this.props.onFailedFilter
            ? this.props.onFailedFilter(collector, message, reason)
            : defaultOnFailedFilter(collector, message, reason)

          if (!message.content) return callFailed(MessageReferenceInputCollectorOnFailedReasons.NoContent)

          if (
            !(await messageByReference(message)) &&
            !(await messageByUrlFromContent(message))
          ) return callFailed(MessageReferenceInputCollectorOnFailedReasons.NoUrlNeitherReference)

          return callFailed(MessageReferenceInputCollectorOnFailedReasons.Unknown)
        }
      })
      .run()

    if (!collectedMessage) return null

    const byReference = await messageByReference(collectedMessage)

    if (byReference) return byReference

    const byUrl = await messageByUrlFromContent(collectedMessage)

    if (byUrl) return byUrl

    throw new Error('Could not figure out where the message were referenced')
  }
}

async function defaultOnFailedFilter(
  collector: MessageCollector,
  message: Message,
  reason: KeyMessageReferenceInputCollectorOnFailedReasons
): Promise<void> {
  const replyAndPushToMessageStack = async (content: string): Promise<void> =>
    collector.pushMessageToMessageStack(await message.reply(content))

  switch (reason) {
    case MessageReferenceInputCollectorOnFailedReasons.NoUrlNeitherReference:
    case MessageReferenceInputCollectorOnFailedReasons.NoContent:
      return replyAndPushToMessageStack('Referencie a mensagem a partir do URL ou respondendo ela!')

    case MessageReferenceInputCollectorOnFailedReasons.Unknown:
      return replyAndPushToMessageStack('Um erro desconhecido aconteceu!')
  }
}

function hasUrl(message: Message): boolean {
  const pattern = /^https:\/\/discord\.com\/channels\/\d{18,20}\/\d{18,20}\/\d{18,20}$/
  return pattern.test(message.content)
}

async function messageByReference(message: Message): Promise<Message | null> {
  return message.fetchReference().catch(() => null)
}

async function messageByUrlFromContent(message: Message): Promise<Message | null> {
  if (!hasUrl(message)) return null

  const [messageId, channelId] = message.content.split('/').reverse()

  const channel = message.client.channels.cache.get(channelId)

  if (channel?.isTextBased() && 'messages' in channel) {
    return channel.messages.fetch(messageId).catch(() => null)
  }

  return null
}

async function filter(message: Message): Promise<boolean> {

  return (
    !!(await messageByReference(message)) ||
    !!(await messageByUrlFromContent(message))
  )
}
