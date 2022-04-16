/* eslint-disable prettier/prettier */
import { Inject, Injectable } from '@nestjs/common';
import { CreateRangesDateDto } from '../dto/create-ranges-date.dto';
import { RangesDateEntity } from '../entities/ranges-date.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { getConnection, Repository } from 'typeorm';
import { DateEntity } from 'src/dates/entities/date.entity';
import { RangeEntity } from 'src/ranges/entities/range.entity';
import { RangesService } from 'src/ranges/ranges.service';
import { DatesService } from 'src/dates/dates.service';
import { Appointment } from '../../dates/dto/appointment.dto';
import { ClientProxy } from '@nestjs/microservices';
import { IndexExportOffersDto } from '../dto/index-export-offers.dto';
import { ReqIndexExportOffersDto } from '../dto/req-index-export-offers.dto';
import { ResponseOffersDto } from '../dto/response-offers.dto';
import { StatusResource } from 'src/commons/enums/status-resources.enum';

@Injectable()
export class RangesDateService {
  constructor(
    private datesService: DatesService,
    private rangesService: RangesService,
    @InjectRepository(RangesDateEntity)
    private rangesDateRepository: Repository<RangesDateEntity>,
    @InjectRepository(DateEntity)
    private dateRepository: Repository<DateEntity>,
    @InjectRepository(RangeEntity)
    private rangeRepository: Repository<RangeEntity>,
    @Inject('APPOINTMENT_STATUS_CONTROLLER_SERVICE')
    private readonly appointmentstatuscontrollerService: ClientProxy,
    @Inject('RESOURCE_SERVICE')
    private readonly resourceService: ClientProxy,
    @Inject('LOCK_SERVICE')
    private readonly lockService: ClientProxy,
    @Inject('SHIFTS_BOOKING_SERVICE')
    private readonly shiftsBookingService: ClientProxy,
    @Inject('APPOINTMENTS_SERVICE')
    private readonly appointmentService: ClientProxy,
  ) {}

  async create(createRangesDateDto: CreateRangesDateDto) {
    const newRangeDate = new RangesDateEntity();
    if (createRangesDateDto.date_id) {
      const date = await this.datesService.findOne(createRangesDateDto.date_id);
      newRangeDate.date = date;
    }

    const ranges: RangeEntity = await this.rangesService.findById(
      createRangesDateDto.range_id,
    );
    if (ranges) {
      newRangeDate.range = ranges;
    }

    newRangeDate.qtity = createRangesDateDto.qtity;
    newRangeDate.ext_user = createRangesDateDto.ext_user;
    newRangeDate.status = createRangesDateDto.status;

    return this.rangesDateRepository.save(newRangeDate);
  }

  findAll() {
    return this.rangesDateRepository.find({ relations: ['date_id'] });
  }

  findOne(id: number) {
    return this.rangesDateRepository.findOne(id);
  }

  async toggle(date_id: number, range_id: number) {
    // eslint-disable-next-line no-var
    var query =
      "Select * from ranges_date_entity where date_id ='" +
      date_id +
      "' and range_id ='" +
      range_id +
      "'";
    //console.log('query: ' + query);
    // eslint-disable-next-line prefer-const
    let rangesDateEntitys: RangesDateEntity[] =
      await this.rangesDateRepository.query(query);
    for (const rangesDateEntity of rangesDateEntitys) {
      rangesDateEntity.status = !rangesDateEntity.status;
      return this.rangesDateRepository.save(rangesDateEntity);
    }
  }

  async toggle_appoint(date_id: number, range_id: number, status_tr: boolean) {
    try {
      console.log('toggle_appoint');

      const rangesDateEntity: RangesDateEntity =
        await this.getRangesDateBydateAndRange(date_id, range_id);

      console.log('call appointment-by-rangedate_id');
      const appointments: Appointment[] = await this.appointmentService
        .send<any>({ cmd: 'appointment-by-rangedate_id' }, rangesDateEntity.id)
        .toPromise();

      console.log('status_tr ' + status_tr);

      console.log('call update-set_status_resource_by_rangedate');
      const status = status_tr ? StatusResource.OPEN : StatusResource.CLOSE;
      await this.resourceService
        .send<any>(
          { cmd: 'update-set_status_resource_by_rangedate' },
          { rangeDate_id: rangesDateEntity.id, status: status },
        )
        .toPromise();

      for (const appointment of appointments) {
        if (status_tr) {
          appointment.status = 'LOCKED';
        } else {
          appointment.status = 'DELETED';
        }

        console.log({ appointment });
        console.log('antes de llamar update-status-controller');
        const q = await this.appointmentstatuscontrollerService
          .send<any>({ cmd: 'update-status-controller' }, appointment)
          .toPromise();
        console.log('despues de llamar update-status-controller', q);
      }
    } catch (e) {
      console.error('Catch', e);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} rangesDate`;
  }

  async indexExportOffers(
    reqIndexExportOfferDto: ReqIndexExportOffersDto,
  ): Promise<any> {
    try {
      let extUser: boolean = null;
      if (reqIndexExportOfferDto.user_id === 'itl_ext_users') {
        extUser = false;
      } else if (reqIndexExportOfferDto.user_id === 'itl_admin_users') {
        extUser = true;
      }
      let containerT = null;

      if (reqIndexExportOfferDto.iso_code === '2200') {
        containerT = 'DRY';
      } else if (reqIndexExportOfferDto.iso_code === '2350') {
        containerT = 'DRY';
      }

      // ---------------------------------------------------------------------------------------
      const booking = await this.shiftsBookingService
        .send<any>({ cmd: 'booking' }, reqIndexExportOfferDto.booking)
        .toPromise();
      const { dataJSON } = booking;
      const { serviceID, vesselVisit } = dataJSON.Booking;
      console.clear();
      console.log('_______________ booking _____________');
      console.log(serviceID);
      console.log(vesselVisit.id);
      console.log('_________________________________________');
      //---------------------------------------------------------------------------------

      const listofExportOffers = [];
      const query =
        `select count(*) as appointments_avilable,rd.date_id,d.[value],rd.range_id,rg.[start],rg.[end],rd.id as range_date_id, r.quantity as total,  ` +
        `(select quantity - ` +
        `(select count(*) appointments_by_containter from appointment_entity a ` +
        `where rangedate_id = rd.id and a.containerType = '${containerT}') ` +
        `from resource_entity res ` +
        `inner join container_type_entity cte on res.[container_type_id] = cte.id ` +
        `where rangesdate_id = rd.id and cte.container_type_id = '${containerT}') ` +
        `as available ` +
        `from appointment_entity a ` +
        `inner join ranges_date_entity rd on a.rangedate_id = rd.id ` +
        `inner join date_entity d on rd.date_id = d.id ` +
        `inner join range_entity rg on rd.range_id = rg.id ` +
        `inner join resource_entity r on r.rangesdate_id = rd.id ` +
        `inner join container_type_entity ctd on r.container_type_id = ctd.id ` +
        `where ctd.container_type_id = '${containerT}' ` +
        `and rd.status= 1 ` +
        `and d.[value] between CONVERT(date,'${reqIndexExportOfferDto.date_from}', 126) ` +
        `and CONVERT(date, '${reqIndexExportOfferDto.date_to}',126) ` +
        `and a.status = 'AVAILABLE' ` +
        `group by rd.date_id,d.[value],rd.range_id,rg.[start],rg.[end],rd.id,r.quantity`;

      console.log('query: ' + query);

      const indexs: IndexExportOffersDto[] =
        await this.rangesDateRepository.query(query);
      let required = 0;
      for (const index of indexs) {
        const offers = new ResponseOffersDto();

        offers.rangedate_id = index.range_date_id;
        offers.date_value = index.value;
        offers.start = index.start;
        offers.end = index.end;
        offers.type_available = index.available;
        offers.type_total = index.total;

        if (reqIndexExportOfferDto.req_quantity >= required) {
          //consulto si esta en bloq y el boke que me paso que es el

          /*
lock={
  _id": Integer,                   //id univoco pk de persistencia
  vessel_id": String,              //el id del vessel  si corresponda  ej:  CATE
  vessel_name": String,            //el name del vessel  si corresponde  eje MSC Caterina
  vessel_visit_id“: String         // el vessel_visit  id si corresponde  eje:   CATE039
  vessel_service“: String          // el service id  si corresponde  eje:   SDG
  type”:   enum [SERVICE, VESSEL_VISIT]      // tipo del lock
  active": Boolean,      //true el lock esta activo y se aplica , false inactivo no se aplica
  id_lock booking o service string
}
*/

          let locked = false;
          console.log('___________ Lamado a index-locks ___________');
          const locks = await this.lockService
            .send<any>({ cmd: 'index-locks' }, offers.rangedate_id)
            .toPromise();
          console.log('___________ Resultado de index-locks[0] ___________');
          console.log(locks[0]);
          console.log('___________________________________________________');

          if (locks) {
            for (const lock of locks) {
              if (
                lock.status &&
                lock.type === 'vessel_vissit' &&
                lock.id_lock === vesselVisit.id
              ) {
                locked = true;
              }

              if (
                lock.status &&
                lock.type === 'service' &&
                lock.id_lock === serviceID
              ) {
                locked = true;
              }
            }
          }

          if (!locked) {
            listofExportOffers.push(offers);
          }
        }
        required += offers.type_available;
      }

      return listofExportOffers;
    } catch (e) {
      console.error('Catch', e);
      throw e;
    }
  }

  async getRangesDateBydateAndRange(
    date_id: number,
    range_id: number,
  ): Promise<RangesDateEntity> {
    return await getConnection()
      .getRepository(RangesDateEntity)
      .createQueryBuilder('user')
      .where('date_id = :date_id', { date_id })
      .andWhere('range_id = :range_id', { range_id })
      .getOne();
  }

  async copyRxD(originId: number, destinyIds: []) {
    const qry = 'Select * from ranges_date_entity where id =' + originId;
    console.log('qry: ' + qry);
    const rangesDate: any[] = await this.rangesDateRepository.query(qry);
    const original = rangesDate[0];
    console.log(original);
    console.log('original. range id: ' + original.date_id);
    const arrActualizados = [];
    for (const destinyId of destinyIds) {
      const qry = 'Select * from ranges_date_entity where id =' + destinyId;
      const actualizables = await this.rangesDateRepository.query(qry);
      const actualizar = actualizables[0];
      console.log('********* actualizable ************');
      console.log({ actualizar });
      console.log('  ---------------------------------  ');

      actualizar.qtity = original.qtity;
      actualizar.status = original.status;
      actualizar.ext_user = original.ext_user;
      //actualizar.date = original.date_id;
      //actualizar.range = original.range_id;

      const actualizadoLimit = await this.datesService.updateLimitRangeDate(
        originId,
        actualizar.id,
      );

      console.log({ actualizadoLimit });
      //  agregar actualizadoLimit que es la cantidad en la respuesta

      const actualizados = await this.rangesDateRepository.save(actualizar);
      console.log('********* actualizado ************');
      console.log('  ---------------------------------  \n\n');
      const valPush = {
        id: actualizados.id,
        qtity: actualizados.qtity,
        status: actualizados.status,
        ext_user: actualizados.ext_user,
        date_id: actualizados.date_id,
        range_id: actualizados.range_id,
        date: actualizados.date,
        range: actualizados.range,
        limit: actualizadoLimit,
      };
      //arrActualizados.push(actualizados, actualizadoLimit);
      arrActualizados.push(valPush);
      //}
    }
    console.log(arrActualizados);

    return arrActualizados;
  }
}
