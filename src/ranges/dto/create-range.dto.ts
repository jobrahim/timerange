import { IsDateString, IsISO8601, IsNotEmpty, Matches } from 'class-validator';
import { RangesDateEntity } from 'src/ranges-date/entities/ranges-date.entity';

export class CreateRangeDto {
  @IsNotEmpty()
  range_id: string;
  //HH:mm
  @IsNotEmpty()
  @Matches(/(\d{4})-(\d{2})-(\d{2})T(\d{2})\:(\d{2})\:(\d{2})\.(\d{3})/, {
    message: 'Invalid date format',
  })
  @IsISO8601({ strict: true })
  start: string;
  //HH:mm
  @Matches(/(\d{4})-(\d{2})-(\d{2})T(\d{2})\:(\d{2})\:(\d{2})\.(\d{3})/, {
    message: 'Invalid date format',
  })
  @IsISO8601({ strict: true })
  end: string;
}
