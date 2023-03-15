import { Message } from 'discord.js'
import { Collector } from './Collector'
import { MessageCollector } from './MessageCollector'

export const TextInputCollectorOnFailedReasons = {
  LengthIsLessThanMinimum: 'LengthIsLessThanMinimum',
  LengthIsGreatherThanMaximum: 'LengthIsGreatherThanMaximum',
  PatternDoesNotMatch: 'PatternDoesNotMatch',
  OtherFilterFailed: 'OtherFilterFailed',
  Unknown: 'Unknown'
} as const

export interface TextInputCollectorProps {
  time?: number
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  silent?: boolean
  otherFilter?: (content: string) => boolean | Promise<boolean>
  onFailedFilter?: (collector: MessageCollector, message: Message, reason: keyof typeof TextInputCollectorOnFailedReasons) => any
}

export class TextInputCollector extends Collector<TextInputCollectorProps> {
  private collector!: MessageCollector

  public stop(): void {
    this.collector.stop()
  }

  public async run(): Promise<string | null> {
    this.collector = new MessageCollector(this)

    const minLength = this.props?.minLength || 1
    const maxLength = this.props?.maxLength || 2048

    const lengthIsLessThanMax = (message: Message): boolean =>
      message.content.length <= maxLength

    const lengthIsGreatherThanMax = (message: Message): boolean =>
      message.content.length > maxLength

    const lengthIsGreatherThanMin = (message: Message): boolean =>
      message.content.length >= minLength

    const lengthIsLessThanMin = (message: Message): boolean =>
      message.content.length < minLength

    const patternMatches = (message: Message): boolean =>
      this.props.pattern ? this.props.pattern.test(message.content) : true

    const passesOtherFilter = async (message: Message): Promise<boolean> =>
      this.props.otherFilter ? await this.props.otherFilter(message.content) : true

    async function filter(message: Message): Promise<boolean> {
      return (
        lengthIsLessThanMax(message) &&
        lengthIsGreatherThanMin(message) &&
        patternMatches(message) &&
        await passesOtherFilter(message)
      )
    }

    async function defaultOnFailedFilter(collector: MessageCollector, message: Message): Promise<void> {
      const replyAndPushToMessageStack = async (content: string): Promise<void> =>
        collector.pushMessageToMessageStack(await message.reply(content))

      if (!(await passesOtherFilter(message))) {
        replyAndPushToMessageStack('A mensagem enviada é inválida.')
      }

      if (lengthIsGreatherThanMax(message)) {
        replyAndPushToMessageStack(`A mensagem é grande de mais! Ela precisa ter menos que ${maxLength} caracteres!`)
      }

      else if (lengthIsLessThanMin(message)) {
        replyAndPushToMessageStack(`A mensagem é curta de mais! Ela precisa ter pelo menos ${minLength} caracteres!`)
      }

      else if (!patternMatches(message)) {
        replyAndPushToMessageStack(`A mensagem não está nos padrões necessários!`)
      }

      else {
        replyAndPushToMessageStack(`A resposta inserida é inválida!`)
      }
    }

    const collectedMessage = await this.collector
      .setProps({
        ...this.props,
        filter,
        onFailedFilter: async (collector, message) => {
          if (!this.props?.onFailedFilter) defaultOnFailedFilter(collector, message)
          else if (!(await passesOtherFilter(message))) this.props.onFailedFilter(collector, message, TextInputCollectorOnFailedReasons.OtherFilterFailed)
          else if (lengthIsGreatherThanMax(message)) this.props.onFailedFilter(collector, message, TextInputCollectorOnFailedReasons.LengthIsGreatherThanMaximum)
          else if (lengthIsLessThanMin(message)) this.props.onFailedFilter(collector, message, TextInputCollectorOnFailedReasons.LengthIsLessThanMinimum)
          else if (!patternMatches(message)) this.props.onFailedFilter(collector, message, TextInputCollectorOnFailedReasons.PatternDoesNotMatch)
          else this.props.onFailedFilter(collector, message, TextInputCollectorOnFailedReasons.Unknown)
        }
      })
      .run()

    return collectedMessage?.content || null
  }
}