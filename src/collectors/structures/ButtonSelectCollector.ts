import { ButtonInteraction, ComponentType, Message } from 'discord.js'
import { Collector } from './Collector'
import { InteractionSelectCollector } from './InteractionSelectCollector'

export interface ButtonSelectCollectorProps {
  message: Message
  time?: number
}

export class ButtonSelectCollector extends Collector<ButtonSelectCollectorProps> {
  private collector!: InteractionSelectCollector<ComponentType.Button>

  public stop(): void {
    this.collector.stop()
  }

  async run(): Promise<ButtonInteraction | null> {
    this.collector = new InteractionSelectCollector<ComponentType.Button>(this)

    const buttonInteraction = await this.collector
    .setProps({
      message: this.props.message,
      time: this.props.time,
      componentType: ComponentType.Button,
      filter: async (collector, interaction) => {
        if (interaction.isButton()) {
          if (interaction.user.id === this.target.id) return true

          await interaction.reply({
            content: 'Você não é o membro que está utilizando este comando.',
            ephemeral: true
          })

          return false
        }

        return false
      },
    })
    .run()

    return buttonInteraction
  }
}