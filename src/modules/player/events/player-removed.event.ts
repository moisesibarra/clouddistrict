import { Player } from '../entities/player.entity'

export class PlayerRemovedEvent {
  constructor(public player: Player) {}
}
