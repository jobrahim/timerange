import {
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
} from 'class-validator';
import { TimeRangeUtils } from 'src/timerange.util';
import { RangeEntity } from '../entities/range.entity';

export class FindRangeDto {
  constructor(range: RangeEntity) {
    this.id = range.id;
    this.range_id = range.range_id;
    this.start = range.start;
    this.end = range.end;
    this.operation_id = range.operation_id;
  }
  @IsNumber()
  id: number;
  @IsString()
  range_id: string;
  @IsNotEmpty()
  @IsISO8601({ strict: true })
  @Matches(/(\d{4})-(\d{2})-(\d{2})T(\d{2})\:(\d{2})\:(\d{2})\.(\d{3})/, {
    message: 'Invalid date format',
  })
  start: string;
  @IsNotEmpty()
  @IsISO8601({ strict: true })
  @Matches(/(\d{4})-(\d{2})-(\d{2})T(\d{2})\:(\d{2})\:(\d{2})\.(\d{3})/, {
    message: 'Invalid date format',
  })
  end: string;
  @IsString()
  operation_id: string;
}
