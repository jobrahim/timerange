import { IsISO8601, Matches, ValidateIf } from 'class-validator';

export class DateISO8601Dto {
  @IsISO8601({ strict: true })
  @Matches(/(\d{4})-(\d{2})-(\d{2})T(\d{2})\:(\d{2})\:(\d{2})\.(\d{3})/, {
    message: 'Invalid date format',
  })
  date: string;
}
