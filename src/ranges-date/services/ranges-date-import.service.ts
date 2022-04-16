import { Injectable } from '@nestjs/common';
import { CreateRangesDateDto } from '../dto/create-ranges-date.dto';
import { UpdateRangesDateDto } from '../dto/update-ranges-date.dto';

@Injectable()
export class RangesDateImportService {
  create(createRangesDateDto: CreateRangesDateDto) {
    return 'This action adds a new rangesDate';
  }

  findAll() {
    return `This action returns all rangesDate`;
  }

  findOne(id: number) {
    return `This action returns a #${id} rangesDate`;
  }

  update(id: number, updateRangesDateDto: UpdateRangesDateDto) {
    return `This action updates a #${id} rangesDate`;
  }

  remove(id: number) {
    return `This action removes a #${id} rangesDate`;
  }
}
