import { IsOptional, IsString } from 'class-validator';
export class CreateAppointmentDto {
  constructor(templateID: string, dataValue: string) {
    this.template_id = templateID;
    this.date_value = dataValue;
  }
  @IsOptional()
  @IsString()
  readonly template_id: string;
  @IsString()
  readonly date_value: string;
}
