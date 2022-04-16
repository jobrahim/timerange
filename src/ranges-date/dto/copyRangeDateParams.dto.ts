import { IsNumber, IsArray } from 'class-validator';

export class CopyRangeDateParamsDto {
  @IsNumber()
  originId: number;
  @IsArray()
  destinosId: [];
}
