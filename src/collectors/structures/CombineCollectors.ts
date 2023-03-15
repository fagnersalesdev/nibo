import { ButtonSelectCollector } from './ButtonSelectCollector'
import { RoleSelectCollector } from './RoleSelectCollector'
import { TextInputCollector } from './TextInputCollector'

import { ChannelInput, AttachmentBufferInput, ButtonSelectInteraction, RoleInput, RoleSelectInteraction, TextInput, ChannelSelectInteraction, StringSelectInteraction, EmojiInput, EmojiGuildInput } from '../customValues'
import { RoleInputCollector } from './RoleInputCollector'
import { AttachmentBufferInputCollector } from './AttachmentBufferInputCollector'
import { ChannelSelectCollector } from './ChannelSelectCollector'
import { StringSelectCollector } from './StringSelectCollector'
import { ChannelInputCollector } from './ChannelInputCollector'
import { EmojiInputCollector } from './EmojiInputCollector'
import { EmojiGuildInputCollector } from './EmojiGuildInputCollector'
import { MessageReferenceInputCollector } from './MessageReferenceInputCollector'
import { MessageReferenceInput } from '../customValues/MessageReferenceInput'

export type CombinableCollectors =
  | TextInputCollector
  | ChannelInputCollector
  | RoleSelectCollector
  | ButtonSelectCollector
  | RoleInputCollector
  | AttachmentBufferInputCollector
  | ChannelSelectCollector
  | StringSelectCollector
  | EmojiInputCollector
  | EmojiGuildInputCollector
  | MessageReferenceInputCollector

type CombineCollectorsReturnType =
  | TextInput
  | RoleInput
  | ChannelInput
  | RoleSelectInteraction
  | ButtonSelectInteraction
  | AttachmentBufferInput
  | ChannelSelectInteraction
  | StringSelectInteraction
  | EmojiInput
  | EmojiGuildInput
  | MessageReferenceInput

export class CombineCollectors {
  private _listeners: (() => void | Promise<void>)[] = []
  private stopped: boolean = false

  public constructor(public readonly collectors: CombinableCollectors[]) { }

  public add(collector: CombinableCollectors): this {
    this.collectors.push(collector)
    return this
  }

  public merge(combined: CombineCollectors): this {
    this.collectors.push(...combined.collectors)
    return this
  }

  public stop(): void {
    if (this.stopped) throw new Error('CombineCollectors is already stopped')
    this.stopped = true
    this.collectors.forEach(collector => collector.stop())
    this._listeners.forEach(listener => listener())
  }

  public onStop(listener: () => void | Promise<void>): this {
    this._listeners.push(listener)
    return this
  }

  async run(): Promise<CombineCollectorsReturnType> {
    const promisedCollectors = this.collectors.map(async collector => {
      if (collector instanceof RoleSelectCollector) return new RoleSelectInteraction(await collector.run())
      if (collector instanceof ButtonSelectCollector) return new ButtonSelectInteraction(await collector.run())
      if (collector instanceof TextInputCollector) return new TextInput(await collector.run())
      if (collector instanceof RoleInputCollector) return new RoleInput(await collector.run())
      if (collector instanceof AttachmentBufferInputCollector) return new AttachmentBufferInput(await collector.run())
      if (collector instanceof ChannelSelectCollector) return new ChannelSelectInteraction(await collector.run())
      if (collector instanceof StringSelectCollector) return new StringSelectInteraction(await collector.run())
      if (collector instanceof ChannelInputCollector) return new ChannelInput(await collector.run())
      if (collector instanceof EmojiInputCollector) return new EmojiInput(await collector.run())
      if (collector instanceof EmojiGuildInputCollector) return new EmojiGuildInput(await collector.run())
      if (collector instanceof MessageReferenceInputCollector) return new MessageReferenceInput(await collector.run())

      throw new Error('Unknown Collector instance')
    })

    const result = await Promise.race(promisedCollectors)

    if (!this.stopped) this.stop()

    return result as CombineCollectorsReturnType
  }
}
