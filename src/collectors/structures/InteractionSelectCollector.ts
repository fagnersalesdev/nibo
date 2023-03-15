import {
  MessageComponentType,
  Message,
  Interaction,
  Collection,
  InteractionCollector as DiscordInteractionCollector,
  ComponentType,
  ButtonInteraction,
  ChannelSelectMenuInteraction,
  MentionableSelectMenuInteraction,
  RoleSelectMenuInteraction,
  StringSelectMenuInteraction,
  UserSelectMenuInteraction
} from 'discord.js'
import { once } from 'events'
import { Collector } from './Collector'

export interface InteractionSelectCollectorRunProps {
  message: Message
  componentType: MessageComponentType
  time?: number
  filter?: (collector: Collector<InteractionSelectCollectorRunProps>, interaction: Interaction) => Promise<boolean>
}

type HandleInteractionToReturn<T extends MessageComponentType> =
  T extends ComponentType.Button
  ? ButtonInteraction
  : T extends ComponentType.ChannelSelect
  ? ChannelSelectMenuInteraction
  : T extends ComponentType.MentionableSelect
  ? MentionableSelectMenuInteraction
  : T extends ComponentType.ChannelSelect
  ? ChannelSelectMenuInteraction
  : T extends ComponentType.RoleSelect
  ? RoleSelectMenuInteraction
  : T extends ComponentType.StringSelect
  ? StringSelectMenuInteraction
  : T extends ComponentType.UserSelect
  ? UserSelectMenuInteraction
  : never

export class InteractionSelectCollector<TComponentType extends MessageComponentType, T extends InteractionSelectCollectorRunProps = InteractionSelectCollectorRunProps> extends Collector<T> {
  private collector!: DiscordInteractionCollector<any>

  public stop(): void {
    this.collector.stop()
  }

  async run(): Promise<HandleInteractionToReturn<TComponentType> | null> {
    this.collector = this.props.message.createMessageComponentCollector({
      componentType: this.props.componentType,
      time: this.props.time,
    })

    this.collector.on('collect', async interaction => {
      const passesFilter = this.props?.filter ? await this.props.filter(this, interaction) : true

      if (!passesFilter) return

      this.collector.stop('finished')
    })

    const [collected, reason] = await once(this.collector, 'end') as [Collection<string, Interaction>, string]

    if (reason === 'finished') {
      return collected.last() as unknown as any
    }

    return null
  }
}