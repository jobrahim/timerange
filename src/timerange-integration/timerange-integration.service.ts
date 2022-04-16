import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DatesService } from 'src/dates/dates.service';
import { CreateDateDto } from 'src/dates/dto/create-date.dto';
import { CreateRangesDateDto } from 'src/ranges-date/dto/create-ranges-date.dto';
import { ReqIndexExportOffersDto } from 'src/ranges-date/dto/req-index-export-offers.dto';
import { RangesDateEntity } from 'src/ranges-date/entities/ranges-date.entity';
import { RangesDateService } from 'src/ranges-date/services/ranges-date.service';
import { RangesService } from 'src/ranges/ranges.service';
import { Repository } from 'typeorm';
import { RangesByOperationDTO } from './dtos/ranges-by-operation.dto';

@Injectable()
export class TimerangeIntegrationService {
  constructor(
    private readonly datesService: DatesService,
    private readonly rangesService: RangesService,
    private readonly rangesDateService: RangesDateService,
    @InjectRepository(RangesDateEntity)
    private readonly rangesDatesnRepository: Repository<RangesDateEntity>,
  ) {}

  async createDate(createDataDto: CreateDateDto) {
    return await this.datesService.create(createDataDto);
  }

  async getRangesByOperation(rangesByOperationDTO: RangesByOperationDTO) {
    return await this.rangesService.index(rangesByOperationDTO.operation_id);
  }

  async createRangesDate(createRangesDateDto: CreateRangesDateDto) {
    return await this.rangesDateService.create(createRangesDateDto);
  }

  async indexExOf(reqIndexExportOffe: any) {
    console.log('desde integration', reqIndexExportOffe);
    const requeriment = new ReqIndexExportOffersDto();

    requeriment.user_id = reqIndexExportOffe.reqIndexExportOfferDto.user_id;
    requeriment.req_quantity =
      reqIndexExportOffe.reqIndexExportOfferDto.req_quantity;
    requeriment.date_from = reqIndexExportOffe.reqIndexExportOfferDto.date_from;
    requeriment.date_to = reqIndexExportOffe.reqIndexExportOfferDto.date_to;
    requeriment.flex = reqIndexExportOffe.reqIndexExportOfferDto.flex;
    requeriment.booking = reqIndexExportOffe.reqIndexExportOfferDto.booking;
    requeriment.booking_item =
      reqIndexExportOffe.reqIndexExportOfferDto.booking_item;
    requeriment.iso_code = reqIndexExportOffe.reqIndexExportOfferDto.iso_code;

    console.log('requeriment', requeriment);
    return await this.rangesDateService.indexExportOffers(requeriment);
  }
  // Search rangeDate date for id
  async getRangesById(id: number) {
    const qry = `SELECT range_id FROM ranges_date_entity where id=${id}`;
    const rd = await this.rangesDatesnRepository.query(qry);
    console.log('rangeDate', rd[0]);
    return rd[0];
  }

  // Search range date for id
  async getFranjaById(id: number) {
    const qry = `SELECT * FROM range_entity where id=${id}`;
    const range = await this.rangesDatesnRepository.query(qry);
    console.log('range', range[0]);
    return range[0];
  }

  async getDateByRangeDateId(id: number) {
    const qry = `SELECT date_id FROM ranges_date_entity where id=${id}`;
    const rangeDate = await this.rangesDatesnRepository.query(qry);
    console.log('date', rangeDate[0].date_id);
    const d = await this.datesService.findOne(rangeDate[0].date_id);

    console.log('date', d);
    console.log('date', d.value);

    return d.value;
  }

  async getRangeDateId(id: number) {
    const qry = `SELECT * FROM ranges_date_entity where id=${id}`;
    const rangeDate = await this.rangesDatesnRepository.query(qry);
    console.log(rangeDate[0]);
    return rangeDate[0];
  }
}
