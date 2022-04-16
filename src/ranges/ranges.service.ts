import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RangesDateEntity } from 'src/ranges-date/entities/ranges-date.entity';
import { Repository } from 'typeorm';
import { CreateRangeDto } from './dto/create-range.dto';
import { FindRangeDto } from './dto/find-range.dto';
import { UpdateRangeDto } from './dto/update-range.dto';
import { RangeEntity } from './entities/range.entity';

@Injectable()
export class RangesService {
  constructor(
    @InjectRepository(RangeEntity)
    private rangeRepository: Repository<RangeEntity>,
    @InjectRepository(RangesDateEntity)
    private rangesDateRepository: Repository<RangesDateEntity>,
  ) {}

  async create(createRangeDto: CreateRangeDto): Promise<RangeEntity> {
    const newRange: RangeEntity = this.rangeRepository.create(createRangeDto);
    return this.rangeRepository.save(newRange);
  }

  async index(operationId: string): Promise<FindRangeDto[]> {
    const query =
      "select * from range_entity where operation_id= '" + operationId + "'";
    const dtos: FindRangeDto[] = [];
    const ranges: RangeEntity[] = await this.rangeRepository.query(query);
    for (const rangeEntity of ranges) {
      dtos.push(new FindRangeDto(rangeEntity));
    }
    return dtos;
  }

  async findOne(id: number) {
    const rangeId = await this.rangeRepository.findOne(id);
    return this.rangeRepository.save(rangeId);
    //    return new FindRangeDto(await this.rangeRepository.findOneOrFail(id));
  }

  async findOneByIdString(id: string): Promise<FindRangeDto> {
    return new FindRangeDto(
      await this.rangeRepository.findOneOrFail({ range_id: id }),
    );
  }

  async findById(id: string) {
    return this.rangeRepository.findOneOrFail({ range_id: id });
  }

  update(id: number, updateRangeDto: UpdateRangeDto): Promise<any> {
    return this.rangeRepository.update(id, updateRangeDto);
  }

  remove(id: number): Promise<any> {
    return this.rangeRepository.delete(id);
  }
}
