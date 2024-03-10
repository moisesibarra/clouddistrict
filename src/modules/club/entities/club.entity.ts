import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'

import { decimalTransformer } from '@/common/transformers/decimal.transformer'
import { Player } from '@/modules/player/entities/player.entity';
import { Coach } from '@/modules/coach/entities/coach.entity';
import { CONFIG_VALUES } from '@/common/constants';

@Entity('clubs')
export class Club {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true })
  name: string

  @Column({
    type: 'decimal',
    precision: CONFIG_VALUES.DECIMAL_PRECISION,
    scale: CONFIG_VALUES.DECIMAL_SCALE,
    nullable: true,
    transformer: decimalTransformer,
  })
  budget: number | null

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date

  @OneToMany(() => Coach, (coach) => coach.club)
  coaches: Coach[]

  @OneToMany(() => Player, (player) => player.club)
  players: Player[]
}
