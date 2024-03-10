import { Coach } from '../entities/coach.entity'

export class CoachRemovedEvent {
  constructor(public coach: Coach) {}
}
