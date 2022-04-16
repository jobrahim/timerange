import { PartialType } from '@nestjs/mapped-types';
import { CreateRangesDateDto } from './create-ranges-date.dto';

export class UpdateRangesDateDto extends PartialType(CreateRangesDateDto) {}
