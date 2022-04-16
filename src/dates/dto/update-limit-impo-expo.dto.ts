import { IsArray, IsObject, IsString } from 'class-validator';

export class UpdateLimitImpoExpoDto {
  @IsString()
  operation_id: string;
  @IsArray()
  limits: [
    {
      range_id: string;
      service_id: number;
      value: number;
    },
  ];
}
