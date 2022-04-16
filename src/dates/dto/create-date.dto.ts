import { IsEnum, IsISO8601, IsString, Matches } from 'class-validator';
import { StatusDateUpdate } from 'src/commons/enums/status-date-update.enum';

export class CreateDateDto {
  @IsISO8601({ strict: true })
  @Matches(/(\d{4})-(\d{2})-(\d{2})T(\d{2})\:(\d{2})\:(\d{2})\.(\d{3})/, {
    message: 'Invalid date format',
  })
  readonly value: string;

  @IsEnum(['open', 'close'], {
    message: 'Bad status value error. Valid status: open, close',
  })
  readonly status: StatusDateUpdate;

  @IsString()
  readonly operation_id: string;
}
