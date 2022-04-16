import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { DateEntity } from '../../dates/entities/date.entity';
import { RangeEntity } from '../../ranges/entities/range.entity';

/**
 * Modela la relacion RangesOfDate con su qty general
 *
 */
@Entity()
export class RangesDateEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  qtity: number;

  @Column()
  status: boolean;

  @Column()
  ext_user: boolean;

  @ManyToOne(() => DateEntity, (dateEntity) => dateEntity.id)
  @JoinColumn({ name: 'date_id' })
  date: DateEntity;

  @ManyToOne(() => RangeEntity, (rangeEntity) => rangeEntity.range_id)
  @JoinColumn({ name: 'range_id' })
  range: RangeEntity;
}

export enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}
