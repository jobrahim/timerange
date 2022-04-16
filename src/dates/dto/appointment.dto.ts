import { IsOptional } from 'class-validator';
export class Appointment {
  @IsOptional()
  id: number;
  expirationMillis: number;
  created: string;
  updated: string;
  owner: string;
  status: string;
  @IsOptional()
  future_status: string;
  rangedate_id: number;
  @IsOptional()
  containerType: number;
}
