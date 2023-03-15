import { ComponentType, Message, StringSelectMenuInteraction } from 'discord.js'
import { Collector } from './Collector'
import { InteractionSelectCollector } from './InteractionSelectCollector'

export interface StringSelectCollectorProps {
  message: Message
  time?: number
}

export class StringSelectCollector extends Collector<StringSelectCollectorProps> {
  private collector!: InteractionSelectCollector<ComponentType.StringSelect>

  public stop(): void {
    this.collector.stop()
  }

  async run(): Promise<StringSelectMenuInteraction | null> {
    this.collector = new InteractionSelectCollector<ComponentType.StringSelect>(this)

    const stringInteraction = await this.collector
      .setProps({
        message: this.props.message,
        time: this.props.time,
        componentType: ComponentType.StringSelect,
        filter: async (collector, interaction) => {
          if (interaction.isStringSelectMenu()) {
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

    return stringInteraction
  }
}