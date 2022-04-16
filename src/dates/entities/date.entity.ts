import { StatusDateUpdate } from 'src/commons/enums/status-date-update.enum';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
/**
 * Modela la Fecha con su valor iso y el estado (open closed)
 */
@Entity()
export class DateEntity {
  @PrimaryGeneratedColumn()
  id: number;
  //Date ISO 8601 String
  @Column({ unique: true })
  value: string;

  @Column()
  status: StatusDateUpdate;

  @Column()
  operation_id: string;
}
