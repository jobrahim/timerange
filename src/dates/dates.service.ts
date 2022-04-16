import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateDateDto } from './dto/create-date.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { getConnection, Repository } from 'typeorm';
import { DateEntity } from './entities/date.entity';
import { ClientProxy } from '@nestjs/microservices';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { StatusUpdate } from 'src/commons/enums/status-update.enum';
import { UpdateLimitImpoExpoDto } from './dto/update-limit-impo-expo.dto';
import { UpdateLimitIEResponseDto } from './dto/update-limit-ie-response.dto';

import { ServiceEntityDto } from './dto/service-entity.dto';
import { StatusDateUpdate } from 'src/commons/enums/status-date-update.enum';
import { RangesDateEntity } from 'src/ranges-date/entities/ranges-date.entity';

@Injectable()
export class DatesService {
  constructor(
    @Inject('FACTORY_TEMPLATE_SERVICE')
    private readonly factoryTemplateService: ClientProxy,
    @Inject('LIMITS_SERVICE') private readonly limitService: ClientProxy,
    @Inject('APPOINTMENTS_SERVICE')
    private readonly appointmentsService: ClientProxy,
    @InjectRepository(DateEntity)
    private dateRepository: Repository<DateEntity>,
    @Inject('APPOINTMENT_STATUS_CONTROLLER_SERVICE')
    private readonly appointmentstatuscontrollerService: ClientProxy,
    @InjectRepository(RangesDateEntity)
    private rangesDateRepository: Repository<RangesDateEntity>,
  ) {}

  async create(createDateDto: CreateDateDto) {
    try {
      const dateEntity = this.dateRepository.create(createDateDto);
      return await this.dateRepository.save(dateEntity);
    } catch (e) {
      if (e.message.search('UNIQUE')) {
        throw new NotFoundException('Date already exists');
      }
      throw e;
    }
  }

  async c_appointment(dateValue: string, operation: string) {
    console.log(`creando Appointment ${dateValue}`);
    const qry =
      `SELECT lim.quota, d.value, lim.name, rd.id ` +
      `FROM ` +
      `ITL_APMNT_MANAGER.dbo.date_entity as d ` +
      `inner join ` +
      `ITL_APMNT_MANAGER.dbo.ranges_date_entity as rd ` +
      `on d.id=rd.date_id ` +
      `inner join ` +
      `ITL_APMNT_MANAGER.dbo.range_entity as r ` +
      `on rd.range_id=r.id ` +
      `inner join ` +
      `ITL_APMNT_MANAGER.dbo.limit_entity as lim ` +
      `on rd.id=lim.rangesdate_id ` +
      //  `WHERE d.value='2021-09-03' `;
      `WHERE CONVERT(date, d.value, 126)= CONVERT(date, '${dateValue}', 126) and d.operation_id='${operation}'`;
    console.log(`----------------------------------------------------------`);
    console.log(`Query  ${qry}`);
    console.log(`----------------------------------------------------------`);
    console.log(`-------------   Resultado de la Qry   --------------------`);
    const datos = await this.dateRepository.query(qry);
    for (const dato of datos) {
      console.log(dato.quota);
      for (let i = 0; i < dato.quota; i++) {
        const apo = {
          expirationMillis: 100000,
          created: dateValue,
          updated: '',
          owner: dato.name,
          status: 'AVAILABLE',
          rangedate_id: dato.id,
          future_status: '',
          containerType: '',
        };

        console.log(apo.created);
        console.log(apo.owner);

        const q = await this.appointmentsService
          .send<any>({ cmd: 'create_appointment' }, apo)
          .toPromise();
        //return q;
      }
    }
  }

  async findAll() {
    const dateEntitys: [DateEntity[], number] =
      await this.dateRepository.findAndCount();
    return dateEntitys;
  }

  findOne(id: number) {
    return this.dateRepository.findOne(id);
  }

  remove(id: number) {
    return this.dateRepository.delete(id);
  }

  /**
   * cierra un dia completo
   * @param dateValue
   * @returns
   */
  async toggle(dateValue: string, operation: string) {
    //TODO: falta parametro ṕara determinar la operacion
    const dateEntitys: DateEntity[] = await getConnection()
      .getRepository(DateEntity)
      .createQueryBuilder('date')
      .where(
        'CONVERT(date, date.value, 126) = CONVERT(date, :dateValue, 126)',
        { dateValue: dateValue },
      )
      .andWhere('date.operation_id = :operation_id', {
        operation_id: operation,
      })
      .getMany();

    console.log(dateEntitys);

    for (const dateEntity of dateEntitys) {
      if (dateEntity.status === StatusDateUpdate.OPEN) {
        dateEntity.status = StatusDateUpdate.CLOSE;
      } else {
        dateEntity.status = StatusDateUpdate.OPEN;
      }
      return this.dateRepository.save(dateEntity);
    }
  }

  /**
   * instancia el dia con
   * @param dateValue
   * @returns
   */
  async template(createAppointmentDto: CreateAppointmentDto) {
    return await this.factoryTemplateService
      .send<any>({ cmd: 'appointment_template_create' }, createAppointmentDto)
      .toPromise();
  }

  async UpdateLimitsOfDate(
    date_id: string,
    updateLimitImpoExpoDto: UpdateLimitImpoExpoDto,
  ) {
    const listOfLimitsUpdate = [];

    let limits = [];

    limits = updateLimitImpoExpoDto.limits;

    for (const limit of limits) {
      const response = new UpdateLimitIEResponseDto();
      //query to get id value of rangedate that contain date and rangeId of limit object

      const date = await this.findByDate(date_id);
      const rangesDate = await this.rangesDateRepository
        .createQueryBuilder('rangeDate')
        .select('rangeDate.id')
        .where('rangeDate.range_id = :range_id', { range_id: limit.range_id })
        .andWhere('rangeDate.date_id = :date_id', { date_id: date })
        .getOne();

      const service: ServiceEntityDto = await this.limitService
        .send<any>({ cmd: 'find-service-by-rangedate' }, rangesDate.id)
        .toPromise();
      let serviceLimit = new ServiceEntityDto();
      serviceLimit = service[0];

      const apps = await this.appointmentsService
        .send<any>({ cmd: 'appointment-by-rangedate_id' }, rangesDate.id)
        .toPromise();
      let val = 0;
      let available = 0;
      for (const ap of apps) {
        if (ap.status != 'DELETED' && ap.status != 'CLOSED') {
          val++;
        }
        if (ap.status === 'AVAILABLE') {
          available++;
        }
      }

      if (limit.value < serviceLimit.quota) {
        let value = 0;

        let toDelete = val - limit.value;
        if (available < toDelete) {
          let lok = 0;
          const lockedToDelete = toDelete - available;
          toDelete = available;
          response.status = StatusUpdate.WARNING;
          for (const appointment of apps) {
            if (
              appointment.status === 'LOCKED' &&
              appointment.future_status != 'DELETED' &&
              lok < lockedToDelete
            ) {
              appointment.status = 'DELETED';
              const ap = await this.appointmentstatuscontrollerService
                .send<any>({ cmd: 'update-status-controller' }, appointment)
                .toPromise();
              lok++;
            } else if (
              appointment.status === 'LOCKED' &&
              appointment.future_status === 'DELETED'
            ) {
              lok++;
            }
          }
        }
        for (const appointment of apps) {
          if (appointment.status === 'AVAILABLE' && value < toDelete) {
            appointment.status = 'DELETED';
            const ap = await this.appointmentstatuscontrollerService
              .send<any>({ cmd: 'update-status-controller' }, appointment)
              .toPromise();
            value++;
          }
        }
        const newLimit = val - toDelete;

        serviceLimit.quota = newLimit;
        const lim = await this.limitService
          .send<any>({ cmd: 'update_quota' }, serviceLimit)
          .toPromise();
        if (serviceLimit.quota === limit.value) {
          response.status = StatusUpdate.SUCCESS; //= 'success: Se pudo agregar la cantidad pedida.';
        }

        response.range_id = limit.range_id;
        response.service_id = serviceLimit.id;

        response.allocated_value = newLimit;
        listOfLimitsUpdate.push(response);
      } else if (limit.value > serviceLimit.quota) {
        serviceLimit.quota = limit.value;
        const lim = await this.limitService
          .send<any>({ cmd: 'update_quota' }, serviceLimit)
          .toPromise();

        const appoStatus = await this.appointmentsService
          .send<any>({ cmd: 'appointment-by-rangedate_id' }, rangesDate.id)
          .toPromise();
        let busy = 0;

        if (appoStatus.length > 0) {
          for (const appoSt of appoStatus) {
            if (appoSt.status != 'DELETED' && appoSt.status != 'CLOSED') {
              busy++;
            }
          }

          const limMax = limit.value - busy;

          for (let i = 0; i < limMax; i++) {
            const apo = {
              expirationMillis: 100000,
              created: date_id,
              updated: '',
              owner: 'SUM',
              status: 'AVAILABLE',
              rangedate_id: rangesDate.id,
              future_status: '',
              containerType: '',
            };

            const q = await this.appointmentsService
              .send<any>({ cmd: 'create_appointment' }, apo)
              .toPromise();
          }
        }
        response.status = StatusUpdate.SUCCESS;
        response.range_id = limit.range_id;
        response.service_id = serviceLimit.id;
        response.allocated_value = serviceLimit.quota;

        listOfLimitsUpdate.push(response);
      } else if (limit.value === serviceLimit.quota) {
        response.status = StatusUpdate.FAILURE;
        response.range_id = limit.range_id;
        response.service_id = serviceLimit.id;
        response.allocated_value = serviceLimit.quota;

        listOfLimitsUpdate.push(response);
      }
    }

    return listOfLimitsUpdate;
  }

  async findByDate(date: string) {
    const dateid = await this.dateRepository
      .createQueryBuilder('date')
      .select('date.id')
      .where(
        'CONVERT(date, date.value, 126) = CONVERT(date, :dateValue, 126)',
        { dateValue: date },
      )
      .getOne();
    return dateid.id;
  }

  async findAppointmentByDateID(dateID: number) {
    // Obtenemos la relacion de date con ranges_date
    const listRangesDates = await this.rangesDateRepository
      .createQueryBuilder()
      .where('date_id = :date_id', { date_id: dateID })
      .getMany();

    // Obtenemos la relacion de ranges_date con appointments
    const listAppointments = [];
    for (const rangesDate of listRangesDates) {
      const appointments = await this.appointmentsService
        .send<any>({ cmd: 'appointment-by-rangedate_id' }, rangesDate.id)
        .toPromise();
      listAppointments.push(...appointments);
    }
    return listAppointments;
  }
  async updateLimitRangeDate(origenId: number, destinoId: number) {
    //________ Origen del que saco la cantidad  _______________

    const origenes = await this.limitService
      .send<any>({ cmd: 'find-service-by-rangedate' }, origenId)
      .toPromise();
    const origen = origenes[0];
    //________ Destino a la cual le seteo el limite del Origen  _______________
    const destinos = await this.limitService
      .send<any>({ cmd: 'find-service-by-rangedate' }, destinoId)
      .toPromise();
    const destino = destinos[0];
    destino.quota = origen.quota;

    await this.limitService
      .send<any>({ cmd: 'update_limits' }, destino)
      .toPromise();
    /*
    const actualizado = await this.limitService
      .send<any>({ cmd: 'update_limits' }, destino)
      .toPromise();
    */
    return destino.quota;
  }
}
