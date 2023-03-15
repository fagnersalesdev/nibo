import { ChannelSelectMenuInteraction, ComponentType, Message } from 'discord.js'
import { Collector } from './Collector'
import { InteractionSelectCollector } from './InteractionSelectCollector'

export interface ChannelSelectCollectorProps {
  message: Message
  time?: number
}

export class ChannelSelectCollector extends Collector<ChannelSelectCollectorProps> {
  private collector!: InteractionSelectCollector<ComponentType.ChannelSelect>

  public stop(): void {
    this.collector.stop()
  }

  async run(): Promise<ChannelSelectMenuInteraction | null> {
    this.collector = new InteractionSelectCollector<ComponentType.ChannelSelect>(this)

    const channelInteraction = await this.collector
      .setProps({
        message: this.props.message,
        time: this.props.time,
        componentType: ComponentType.ChannelSelect,
        filter: async (collector, interaction) => {
          if (interaction.isChannelSelectMenu()) {
            if (interaction.user.id === this.target.id) return true

            await interaction.reply({
              content: 'Você não é o membro que está utilizando este comando.',
              ephemeral: true
            })

            return false
          }

          return false
        },
      }).run()

    return channelInteraction
  }
}