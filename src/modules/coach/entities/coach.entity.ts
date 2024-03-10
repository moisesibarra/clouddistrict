import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import { decimalTransformer } from '@/common/transformers/decimal.transformer'
import { Club } from '@/modules/club/entities/club.entity'
import { CONFIG_VALUES } from '@/common/constants'

@Entity('coaches')
export class Coach {
  @PrimaryGeneratedColumn()
  id: number

  @Column({
    nullable: false,
  })
  name: string

  @Column({
    nullable: false,
  })
  surname: string

  @Column({
    nullable: false,
  })
  email: string

  @Column({
    type: 'decimal',
    precision: CONFIG_VALUES.DECIMAL_PRECISION,
    scale: CONFIG_VALUES.DECIMAL_SCALE,
    nullable: true,
    transformer: decimalTransformer,
  })
  salary: number | null

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date

  @ManyToOne((type) => Club, (club) => club.coaches, {
    nullable: true,
  })
  club: Club | null
}
