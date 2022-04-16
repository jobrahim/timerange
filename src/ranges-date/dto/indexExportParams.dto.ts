import { IsISO8601, IsString, Matches } from 'class-validator';

export class IndexExportParamsDto {
  @Matches(/(\d{4})-(\d{2})-(\d{2})T(\d{2})\:(\d{2})\:(\d{2})\.(\d{3})/, {
    message: 'Invalid date format',
  })
  @IsISO8601({ strict: true })
  date: string;
  @IsString()
  operation_id: string;
}
