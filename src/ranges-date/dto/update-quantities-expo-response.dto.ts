import { IsArray, IsNumber, IsString } from 'class-validator';
import { RangeEntity } from 'src/ranges/entities/range.entity';
export class UpdateQuantitesExpoResponseDto {
  @IsString()
  status: string;
  @IsString()
  range_id: string;
  @IsNumber()
  container_id: number;
  @IsNumber()
  allocated_qtity: number;
  @IsArray()
  idApp: [];
}
