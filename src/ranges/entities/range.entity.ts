import { RangesDateEntity } from 'src/ranges-date/entities/ranges-date.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';

/**
 * Modela el rango horario (slot time) ejemplo de 7:30 a 11:00 asociado a una operacion_id (IMPO EXPO etc)
 */
@Entity()
export class RangeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  range_id: string;

  @Column()
  start: string;

  @Column()
  end: string;

  @Column()
  operation_id: string;
}
