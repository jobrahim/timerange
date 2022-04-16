import { RangeEntity } from 'src/ranges/entities/range.entity';
import { IsArray, IsObject, IsString } from 'class-validator';
export class UpdateQuantitesExpoDto {
  @IsString()
  operation_id: string;
  @IsArray()
  ranges: [
    {
      range_id: string;
      container_id: number;
      qtity: number;
      open: boolean;
    },
  ];
}
