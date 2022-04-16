import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { RangeEntity } from 'src/ranges/entities/range.entity';
import { Status } from '../entities/ranges-date.entity';

export class CreateRangesDateDto {
  @IsNumber()
  qtity: number;
  @IsBoolean()
  status: boolean;
  @IsBoolean()
  ext_user: boolean;
  @IsNumber()
  readonly date_id: number;
  @IsString()
  readonly range_id: string;
  // @IsBoolean()
  // readonly active: boolean;

  readonly rangeid: string;
}
