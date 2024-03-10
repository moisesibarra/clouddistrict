import { Coach } from '../entities/coach.entity'

export class CoachAddedEvent {
  constructor(public coach: Coach) {}
}
