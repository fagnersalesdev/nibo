import { Message } from 'discord.js'
import { Collector } from './Collector'
import { MessageCollector } from './MessageCollector'

export const EmojiInputCollectorOnFailedReasons = {
  NoContent: 'NoContent',
  NoEmoji: 'NoEmoji',
  Unknown: 'Unknown'
} as const

type KeyEmojiInputCollectorOnFailedReasons = keyof typeof EmojiInputCollectorOnFailedReasons

export interface EmojiInputCollectorProps {
  animatedOnly?: boolean
  onFailedFilter?: (
    collector: MessageCollector,
    message: Message,
    reason: KeyEmojiInputCollectorOnFailedReasons
  ) => void
}

export class EmojiInputCollector extends Collector<EmojiInputCollectorProps> {
  private collector!: MessageCollector

  public stop(): void {
    this.collector.stop()
  }

  public async run(): Promise<string | null> {
    this.collector = new MessageCollector(this)

    const collectedMessage = await this.collector
      .setProps({
        ...this.props,
        filter,
        onFailedFilter: async (collector, message) => {
          const callFailed = (reason: KeyEmojiInputCollectorOnFailedReasons): void | Promise<void> => !!this.props.onFailedFilter
            ? this.props.onFailedFilter(collector, message, reason)
            : defaultOnFailedFilter(collector, message, reason)

          if (!message.content) return callFailed(EmojiInputCollectorOnFailedReasons.NoContent)

          const hasEmoji = await filter(message)

          if (!hasEmoji) return callFailed(EmojiInputCollectorOnFailedReasons.NoEmoji)

          return callFailed(EmojiInputCollectorOnFailedReasons.Unknown)
        }
      })
      .run()

    return collectedMessage?.content || null
  }
}

async function defaultOnFailedFilter(
  collector: MessageCollector,
  message: Message,
  reason: KeyEmojiInputCollectorOnFailedReasons
): Promise<void> {
  const replyAndPushToMessageStack = async (content: string): Promise<void> =>
    collector.pushMessageToMessageStack(await message.reply(content))

  switch (reason) {
    case EmojiInputCollectorOnFailedReasons.NoContent:
      return replyAndPushToMessageStack('A mensagem precisa ter um conteúdo, mais especificamente um texto com emoji.')

    case EmojiInputCollectorOnFailedReasons.NoEmoji:
      return replyAndPushToMessageStack('Não consegui encontrarn enhum emoji na mensagem.')

    case EmojiInputCollectorOnFailedReasons.Unknown:
      return replyAndPushToMessageStack('Um erro desconhecido aconteceu!')
  }
}

async function filter(message: Message): Promise<boolean> {
  try {
    await message.react(message.content)
    return true
  } catch (error: unknown) {
    return false
  }
}
