import { GuildEmoji, Message } from 'discord.js'
import { Collector } from './Collector'
import { MessageCollector } from './MessageCollector'

export const EmojiGuildInputCollectorOnFailedReasons = {
  NoContent: 'NoContent',
  NoEmoji: 'NoEmoji',
  NotAnimated: 'NotAnimated',
  Unknown: 'Unknown'
} as const

type KeyEmojiGuildInputCollectorOnFailedReasons = keyof typeof EmojiGuildInputCollectorOnFailedReasons

export interface EmojiGuildInputCollectorProps {
  animatedOnly?: boolean
  onFailedFilter?: (collector: MessageCollector, message: Message, reason: KeyEmojiGuildInputCollectorOnFailedReasons) => void
}

export class EmojiGuildInputCollector extends Collector<EmojiGuildInputCollectorProps> {
  private collector!: MessageCollector

  public stop(): void {
    this.collector.stop()
  }

  public async run(): Promise<GuildEmoji | null> {
    this.collector = new MessageCollector(this)

    const collectedMessage = await this.collector
      .setProps({
        ...this.props,
        filter,
        onFailedFilter: (collector, message) => {
          const callFailed = (reason: KeyEmojiGuildInputCollectorOnFailedReasons) => !!this.props.onFailedFilter
            ? this.props.onFailedFilter(collector, message, reason)
            : defaultOnFailedFilter(collector, message, reason)

          if (!message.content) return callFailed(EmojiGuildInputCollectorOnFailedReasons.NoContent)

          const emoji = findGuildEmojiFromContent(message)

          if (!emoji) return callFailed(EmojiGuildInputCollectorOnFailedReasons.NoEmoji)

          if (this.props.animatedOnly && emoji.animated) return callFailed(EmojiGuildInputCollectorOnFailedReasons.NotAnimated)

          return callFailed(EmojiGuildInputCollectorOnFailedReasons.Unknown)
        }
      })
      .run()

    if (!collectedMessage) return null

    const emoji = findGuildEmojiFromContent(collectedMessage)

    if (!emoji) throw new Error('No emoji provided for the passed collector')

    return emoji
  }
}

async function defaultOnFailedFilter(
  collector: MessageCollector,
  message: Message,
  reason: KeyEmojiGuildInputCollectorOnFailedReasons
): Promise<void> {
  const replyAndPushToMessageStack = async (content: string): Promise<void> =>
    collector.pushMessageToMessageStack(await message.reply(content))

  switch (reason) {
    case EmojiGuildInputCollectorOnFailedReasons.NoContent:
      return replyAndPushToMessageStack('A mensagem precisa ter um conteúdo, mais especificamente um texto com emoji.')

    case EmojiGuildInputCollectorOnFailedReasons.NoEmoji:
      return replyAndPushToMessageStack('Não consegui encontrarn enhum emoji na mensagem.')

    case EmojiGuildInputCollectorOnFailedReasons.NotAnimated:
      return replyAndPushToMessageStack('O emoji precisa ser animado.')

    case EmojiGuildInputCollectorOnFailedReasons.Unknown:
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

function findGuildEmojiFromContent(message: Message): GuildEmoji | null {
  const emojiId = message.content.split(':')[2].slice(0, -1)

  const emoji = message.guild?.emojis.cache.find(emoji => emoji.id === emojiId)

  if (emoji) return emoji

  return null
}