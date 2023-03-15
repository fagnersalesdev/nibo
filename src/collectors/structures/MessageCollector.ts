import { Collection, Message, MessageCollector as DiscordMessageCollector } from 'discord.js'
import { once } from 'events'
import { Collector } from './Collector'

export interface MessageCollectorRunOptions {
  silent?: boolean
  time?: number
  filter?: (message: Message) => boolean | Promise<boolean>
  onFailedFilter?: (collector: MessageCollector, message: Message) => any
}

export class MessageCollector extends Collector<MessageCollectorRunOptions> {
  public collecting: boolean = true
  public collector!: DiscordMessageCollector

  public messageStack: Collection<string, Message> = new Collection()

  public swapCollecting(): void {
    this.collecting = !this.collecting
  }

  public pushMessageToMessageStack(message: Message): void {
    this.messageStack.set(message.id, message)
  }

  public async bulkDeleteMessageStack(): Promise<void> {
    await this.location.bulkDelete(this.messageStack.map(({ id }) => id)).catch(() => { })
  }

  public stop(): void {
    if (!this.collector.ended) this.collector.stop()
  }

  public async run(): Promise<Message | null> {
    this.collector = this.location.createMessageCollector({
      time: this.props?.time,
      filter: message => this.collecting && message.author.id === this.target.id
    })

    this.collector.on('collect', async message => {
      this.pushMessageToMessageStack(message)

      const passesFilter = this.props?.filter ? await this.props.filter(message) : true

      if (!passesFilter) {
        if (this.props?.onFailedFilter && !this.props?.silent) {
          this.swapCollecting()
          await this.props.onFailedFilter(this, message)
          this.swapCollecting()
        }

        return
      }

      this.collector.stop('finished')
    })

    const [collected, reason] = await once(this.collector, 'end') as [Collection<string, Message>, string]

    await this.bulkDeleteMessageStack()

    if (reason === 'finished') {
      return collected.last()!
    }

    return null
  }
}