import { Player } from '../entities/player.entity'

export class PlayerAddedEvent {
  constructor(public player: Player) {}
}
