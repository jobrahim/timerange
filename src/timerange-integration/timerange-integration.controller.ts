import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { CreateDateDto } from 'src/dates/dto/create-date.dto';
import { CreateRangesDateDto } from 'src/ranges-date/dto/create-ranges-date.dto';
import { ReqIndexExportOffersDto } from 'src/ranges-date/dto/req-index-export-offers.dto';
import { RangesByOperationDTO } from './dtos/ranges-by-operation.dto';
import { TimerangeIntegrationService } from './timerange-integration.service';

@Controller('timerange-integration')
export class TimerangeIntegrationController {
  constructor(
    private readonly timeRangeIntService: TimerangeIntegrationService,
  ) {}

  @MessagePattern({ cmd: 'create_date' })
  async createDate(createDataDto: CreateDateDto) {
    try {
      console.log('call createDate');
      return await this.timeRangeIntService.createDate(createDataDto);
    } catch (error) {
      console.log(error);
      return { error };
    }
  }

  @MessagePattern({ cmd: 'range_by_operation' })
  async getRangesByOperation(rangesByOperationDTO: RangesByOperationDTO) {
    try {
      console.log('call range_by_operation');
      return await this.timeRangeIntService.getRangesByOperation(
        rangesByOperationDTO,
      );
    } catch (error) {
      console.log(error);
      return { error };
    }
  }

  @MessagePattern({ cmd: 'create_rangesdate' })
  async createRangesDate(createRangesDateDto: CreateRangesDateDto) {
    try {
      console.log('call create_rangesdate');
      return await this.timeRangeIntService.createRangesDate(
        createRangesDateDto,
      );
    } catch (error) {
      console.log(error);
      return { error };
    }
  }

  @MessagePattern({ cmd: 'index-export-offers' })
  async indexExOf(reqIndexExportOffe: ReqIndexExportOffersDto) {
    try {
      console.log('call index-export-offers');
      return await this.timeRangeIntService.indexExOf(reqIndexExportOffe);
    } catch (error) {
      console.log(error);
      return { error };
    }
  }

  // Search rangeDate date for id
  @MessagePattern({ cmd: 'find-range-date' })
  async getRangesById(id: number) {
    try {
      console.log('call find-range-date');
      return await this.timeRangeIntService.getRangesById(id);
    } catch (error) {
      console.log(error);
      return { error };
    }
  }

  // Search range date for id
  @MessagePattern({ cmd: 'find-range-franja' })
  async getFranjaById(id: number) {
    try {
      console.log('call find-range-franja');
      return await this.timeRangeIntService.getFranjaById(id);
    } catch (error) {
      console.log(error);
      return { error };
    }
  }

  @MessagePattern({ cmd: 'find-date-by-rangeDateId' })
  async getDateByRangeDateId(id: number) {
    try {
      console.log('call find-date-by-rangeDateId');
      return await this.timeRangeIntService.getDateByRangeDateId(id);
    } catch (error) {
      console.log(error);
      return { error };
    }
  }

  // eslint-disable-next-line @typescript-eslint/adjacent-overload-signatures
  @MessagePattern({ cmd: 'find-rangeDate-id' })
  async getRangeDateId(id: number) {
    try {
      console.log('call find-range-date');
      return await this.timeRangeIntService.getRangeDateId(id);
    } catch (error) {
      console.log(error);
      return { error };
    }
  }
}
