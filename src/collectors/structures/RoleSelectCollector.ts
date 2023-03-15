import { ComponentType, Message, RoleSelectMenuInteraction } from 'discord.js'
import { Collector } from './Collector'
import { InteractionSelectCollector } from './InteractionSelectCollector'

export interface RoleSelectCollectorProps {
  message: Message
  time?: number
}

export class RoleSelectCollector extends Collector<RoleSelectCollectorProps> {
  private collector!: InteractionSelectCollector<ComponentType.RoleSelect>

  public stop(): void {
    this.collector.stop()
  }

  async run(): Promise<RoleSelectMenuInteraction | null> {
    this.collector = new InteractionSelectCollector<ComponentType.RoleSelect>(this)

    const roleInteraction = await this.collector
      .setProps({
        message: this.props.message,
        time: this.props.time,
        componentType: ComponentType.RoleSelect,
        filter: async (collector, interaction) => {
          if (interaction.isRoleSelectMenu()) {
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

    return roleInteraction
  }
}