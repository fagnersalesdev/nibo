import axios from 'axios'
import { Message } from 'discord.js'
import { Collector } from './Collector'
import { MessageCollector } from './MessageCollector'

const AttachmentBufferInputCollectorOnFailedReasons = {
  NoAttachment: 'NoAttachment',
  InvalidType: 'InvalidType',
  SizeIsGreatherThanMaximum: 'SizeIsGreatherThanMaximum',
  Unknown: 'Unknown'
} as const

type KeyAttachmentBufferInputCollectorOnFailedReasons = keyof typeof AttachmentBufferInputCollectorOnFailedReasons

export type AttachmentBufferInputTypes = 'image/jpeg' | 'image/jpg' | 'image/png' | 'image/gif' | 'image/webp'

export interface AttachmentBufferInputCollectorProps {
  maxSize?: number
  availableTypes?: AttachmentBufferInputTypes[]
  onFailedFilter?: (collector: MessageCollector, message: Message, reason: KeyAttachmentBufferInputCollectorOnFailedReasons) => void
}

export class AttachmentBufferInputCollector extends Collector<AttachmentBufferInputCollectorProps> {
  private collector!: MessageCollector

  public stop(): void {
    this.collector.stop()
  }

  public async run(): Promise<{ mime: string, extension: string, buffer: Buffer } | null> {
    this.collector = new MessageCollector(this)

    const collectedMessage = await this.collector
      .setProps({
        ...this.props,
        filter: (message) => makeFilter(message, this.props),
        onFailedFilter: (collector, message) => {
          const callFailed = (reason: KeyAttachmentBufferInputCollectorOnFailedReasons) => this.props.onFailedFilter
            ? this.props.onFailedFilter(collector, message, reason)
            : defaultOnFailedFilter(collector, message, reason, this.props)

          if (!hasAttachment(message)) return callFailed(AttachmentBufferInputCollectorOnFailedReasons.NoAttachment)

          if (!isValidType(message, this.props)) return callFailed(AttachmentBufferInputCollectorOnFailedReasons.InvalidType)

          if (!attachmentSizeIsLessThanMax(message, this.props)) return callFailed(AttachmentBufferInputCollectorOnFailedReasons.SizeIsGreatherThanMaximum)

          return callFailed(AttachmentBufferInputCollectorOnFailedReasons.Unknown)
        }
      })
      .run()

    const attachment = collectedMessage?.attachments.first()

    if (!attachment?.contentType) return null

    const attachmentFileData = {
      mime: attachment.contentType,
      extension: attachment.contentType.split('/')[1],
      buffer: (await axios.get(attachment.url, { responseType: 'arraybuffer' })).data
    }

    return attachmentFileData
  }

}

function hasAttachment(message: Message): boolean {
  return message.attachments.size > 0
}

function isValidType(message: Message, props: AttachmentBufferInputCollectorProps) {
  if (!props.availableTypes) return true

  return props.availableTypes.some((availableType) => availableType === message.attachments.first()?.contentType)
}


function attachmentSizeIsLessThanMax(message: Message, props: AttachmentBufferInputCollectorProps): boolean {
  return props.maxSize ? (message.attachments.first()?.size || 0) <= props.maxSize : true
}

async function makeFilter(message: Message, props: AttachmentBufferInputCollectorProps): Promise<boolean> {
  return (hasAttachment(message) && isValidType(message, props) && attachmentSizeIsLessThanMax(message, props))
}

async function defaultOnFailedFilter(collector: MessageCollector,
  message: Message,
  reason: KeyAttachmentBufferInputCollectorOnFailedReasons,
  props: AttachmentBufferInputCollectorProps): Promise<void> {
  const replyAndPushToMessageStack = async (content: string): Promise<void> => collector.pushMessageToMessageStack(await message.reply(content))

  switch (reason) {
    case AttachmentBufferInputCollectorOnFailedReasons.NoAttachment: return replyAndPushToMessageStack('Nenhum arquivo foi encontrado na mensagem, lembre-se de enviar um, ao invés de utilizar link.')
    case AttachmentBufferInputCollectorOnFailedReasons.InvalidType: return props.availableTypes
      ? replyAndPushToMessageStack(`O tipo de arquivo é inválido, é necessário ser um dos seguintes tipos: ${props.availableTypes.join(', ')}`)
      : replyAndPushToMessageStack('O tipo de arquivo é inválido.')

    case AttachmentBufferInputCollectorOnFailedReasons.SizeIsGreatherThanMaximum: return props.maxSize
      ? replyAndPushToMessageStack(`O tamanho do arquivo é muito grande, é necessário ser menor do que \`${props.maxSize}\``)
      : replyAndPushToMessageStack('O tamanho do arquivo é muito grande.')

    case AttachmentBufferInputCollectorOnFailedReasons.Unknown: return replyAndPushToMessageStack(`A resposta inserida é inválida!`)
  }
}