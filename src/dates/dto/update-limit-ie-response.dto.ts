import { StatusUpdate } from 'src/commons/enums/status-update.enum';

export class UpdateLimitIEResponseDto {
  status: StatusUpdate;
  range_id: string;
  service_id: number;
  allocated_value: number;
}
