import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RangesDateEntity } from '../entities/ranges-date.entity';
import { UpdateRangesDateDto } from '../dto/update-ranges-date.dto';
import { DatesService } from 'src/dates/dates.service';
import { UpdateQuantitesExpoDto } from '../dto/update-quantities-expo.dto';
import { ClientProxy } from '@nestjs/microservices';
import { StatusUpdate } from 'src/commons/enums/status-update.enum';
import { IndexRangesOfDateLimitExpo } from '../dto/indexRangesOfDateExpo.dto';
import { IndexRangesOfDateExRespoDto } from '../dto/indexRangesOfDateExRespo.dto';

@Injectable()
export class RangesDateExportService {
  constructor(
    @Inject('APPOINTMENTS_SERVICE')
    private readonly appointmentsService: ClientProxy,
    @Inject('APPOINTMENT_STATUS_CONTROLLER_SERVICE')
    private readonly appointmentstatuscontrollerService: ClientProxy,
    @Inject('RESOURCE_SERVICE')
    private readonly resourceService: ClientProxy,
    @InjectRepository(RangesDateEntity)
    private rangesDateRepository: Repository<RangesDateEntity>,
  ) {}

  findAll() {
    return `This action returns all rangesDate`;
  }

  findOne(id: number) {
    return `This action returns a #${id} rangesDate`;
  }

  async toggle(date: string, range_id: string) {
    // eslint-disable-next-line no-var
    try {
      const query =
        `select rde.id,rde.qtity, rde.status, rde.ext_user,rde.date_id,rde.range_id ` +
        `from ranges_date_entity rde inner join date_entity de ` +
        `on de.id = rde.date_id ` +
        `inner join range_entity re on rde.range_id = re.id ` +
        `where CONVERT(date,de.value, 126) = CONVERT(date,'${date}', 126) and re.range_id = '${range_id}'`;

      console.log('query: ' + query);

      const rangesDateEntitys: RangesDateEntity[] =
        await this.rangesDateRepository.query(query);
      console.log('query result: ', rangesDateEntitys);

      if (rangesDateEntitys.length < 0) {
        throw new NotFoundException('No existe el rango');
      }

      const rangesDate = rangesDateEntitys[0];
      console.log('ext_user: ', rangesDate.ext_user);
      rangesDate.ext_user = !rangesDate.ext_user;
      return this.rangesDateRepository.save(rangesDate);
    } catch (error) {
      console.log('error: ', error);
      throw new InternalServerErrorException(error);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} rangesDate`;
  }

  async indexExport(date: string, operation_id: string): Promise<any> {
    const listOfRangesDates = [];

    const queryLimit =
      `select  rde.id as range_date_id, de.id as date_id, de.status as date_status,re.id as range_id, re.range_id as range_id_str, re.[start], re.[end], rde.[status], rde.ext_user, lm.id as limit_id, lm.quota ` +
      `from ranges_date_entity rde ` +
      `left join date_entity de on rde.date_id = de.id ` +
      `left join range_entity re on rde.range_id = re.id ` +
      `left join limit_entity lm on lm.rangesdate_id = rde.id ` +
      `where CONVERT(date, de.value, 126) = CONVERT(date, '${date}', 126)  and de.operation_id ='${operation_id}'`;

    console.log(queryLimit);
    const rangesDates: IndexRangesOfDateLimitExpo[] =
      await this.rangesDateRepository.query(queryLimit);
    console.log('rangesDates', rangesDates);

    for (const rangesDate of rangesDates) {
      const indexRoD: IndexRangesOfDateExRespoDto =
        new IndexRangesOfDateExRespoDto();

      const queryContainers =
        'select ct.container_type_id as id,SUM(r.quantity) as quantity from container_type_entity ct ' +
        'left join resource_entity r on r.container_type_id = ct.id ' +
        "where r.rangesdate_id ='" +
        rangesDate.range_date_id +
        "'" +
        'GROUP BY ct.container_type_id';
      console.log(queryContainers);
      const containers = await this.rangesDateRepository.query(queryContainers);

      indexRoD._id = rangesDate.range_date_id;
      indexRoD.date_status = rangesDate.date_status;
      indexRoD.date_id = rangesDate.date_id;
      indexRoD.range_id = rangesDate.range_id;
      indexRoD.range_id_str = rangesDate.range_id_str;
      indexRoD.start = rangesDate.start;
      indexRoD.end = rangesDate.end;
      indexRoD.open = rangesDate.status;
      indexRoD.ext_user = rangesDate.ext_user;
      indexRoD.containers = containers;
      indexRoD.limits = [{ id: rangesDate.limit_id, quota: rangesDate.quota }];
      listOfRangesDates.push(indexRoD);

      console.log('listofRangesDates', listOfRangesDates);
    }

    return listOfRangesDates;
  }

  async update(
    date_id: string,
    operation_id: string,
    updateRangesDateDto: UpdateRangesDateDto,
  ): Promise<any> {
    const query =
      "Select * from ranges_date_entity where date_id ='" +
      date_id +
      "' and operation_id ='" +
      operation_id +
      "'";
    // eslint-disable-next-line prefer-const
    let rangesDateEntitys: RangesDateEntity[] =
      await this.rangesDateRepository.query(query);

    for (const rangesDateEntity of rangesDateEntitys) {
      rangesDateEntity.qtity = updateRangesDateDto.qtity;
      // rangesDateEntity.range_id = updateRangesDateDto.range_id;

      return this.rangesDateRepository.save(rangesDateEntity);
    }
  }

  async updateQuantitiesExpo(
    dateValue: string,
    updateQuantitesExpoDto: UpdateQuantitesExpoDto,
  ) {
    try {
      const listResoucesUpdate = [];
      // Se recorren las lista de ranges
      for (const ranges of updateQuantitesExpoDto.ranges) {
        const queryFer =
          `select rs.id, rs.[status], rs.rangesdate_id, rs.quantity, rs.type, rs.container_type_id as container_id ` +
          `from ranges_date_entity rod inner join range_entity r ` +
          `on r.id = rod.range_id inner join date_entity d ` +
          `on rod.date_id = d.id inner join resource_entity rs ` +
          `on rs.rangesdate_id = rod.id inner join container_type_entity ct ` +
          `on ct.id = rs.container_type_id inner join operation_entity o ` +
          `on r.operation_id = o.operation_id ` +
          `where r.range_id = '${ranges.range_id}' ` +
          `and CONVERT(date, d.value, 126)  = CONVERT(date, '${dateValue}', 126)  ` +
          `and ct.container_type_id = '${ranges.container_id}' ` +
          `and o.operation_id = '${updateQuantitesExpoDto.operation_id}'`;

        // Se obtiene la cantidad del recurso relacionado con el ranges, el date y el container
        const [resource]: any = await this.rangesDateRepository.query(queryFer);

        const queryAppoint =
          `select count(*) as appointUsed ` +
          `from appointment_entity a ` +
          `inner join container_type_entity c on a.containerType = c.id ` +
          `inner join ranges_date_entity rd on rd.id = a.rangedate_id ` +
          `inner join range_entity r on r.id = rd.range_id ` +
          `inner join date_entity d on d.id = rd.date_id ` +
          `where c.container_type_id = '${ranges.container_id}' and r.range_id = '${ranges.range_id}' and d.value = CONVERT(date, '${dateValue}', 126)`;

        // Cantidad de apoinment usados con el container en en rango y dia
        const [{ appointUsed }] = await this.rangesDateRepository.query(
          queryAppoint,
        );

        if (resource) {
          // Se calcula la cantidad de recursos disponibles
          const resourcesAvailable = resource.quantity - appointUsed;

          // Si el recurso tiene lugares disponibles
          if (resourcesAvailable > 0) {
            // Si la cantidad de recursos usados es mayor igual a la cantidad que el cliente solicita modificar
            if (appointUsed >= ranges.qtity) {
              // Se actualiza la cantidad minima posible es ese momento
              resource.quantity = appointUsed;
              console.log('call update_resource 1');
              const r = await this.resourceService
                .send<any>({ cmd: 'update_resource' }, resource)
                .toPromise();
              if (r.affected > 0) {
                listResoucesUpdate.push({
                  status: StatusUpdate.WARNING,
                  range_id: ranges.range_id,
                  allocated_qtity: resource.quantity,
                });
              }
              // Si la cantidad de recursos usados es menor a la cantidad que el cliente solicita modificar
            } else if (appointUsed < ranges.qtity) {
              // Se actualizar con el valor que el cliente solicita
              resource.quantity = ranges.qtity;
              console.log('call update_resource 2');
              const r = await this.resourceService
                .send<any>({ cmd: 'update_resource' }, resource)
                .toPromise();
              if (r.affected > 0) {
                listResoucesUpdate.push({
                  status: StatusUpdate.SUCCESS,
                  range_id: ranges.range_id,
                  allocated_qtity: resource.quantity,
                });
              } else {
                listResoucesUpdate.push({
                  status: StatusUpdate.FAILURE,
                  range_id: ranges.range_id,
                  allocated_qtity: resource.quantity,
                });
              }
            }
          } else {
            if (appointUsed < ranges.qtity) {
              // Se actualizar con el valor que el cliente solicita
              resource.quantity = ranges.qtity;
              console.log('call update_resource 3');
              const r = await this.resourceService
                .send<any>({ cmd: 'update_resource' }, resource)
                .toPromise();
              if (r.affected > 0) {
                listResoucesUpdate.push({
                  status: StatusUpdate.SUCCESS,
                  range_id: ranges.range_id,
                  allocated_qtity: resource.quantity,
                });
              } else {
                listResoucesUpdate.push({
                  status: StatusUpdate.FAILURE,
                  range_id: ranges.range_id,
                  allocated_qtity: resource.quantity,
                });
              }
            } else {
              listResoucesUpdate.push({
                status: StatusUpdate.FAILURE,
                range_id: ranges.range_id,
                allocated_qtity: 0,
              });
            }
          }
        } else {
          listResoucesUpdate.push({
            status: StatusUpdate.FAILURE,
            range_id: ranges.range_id,
            allocated_qtity: 0,
            error: 'No hay registros para el dia ingresado',
          });
        }
      }
      return listResoucesUpdate;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error);
    }
  }
  async crearAppointment(cantidad, apo) {
    for (let i = 0; i < cantidad; i++) {
      const q = await this.appointmentsService
        .send<any>({ cmd: 'create_appointment' }, apo)
        .toPromise();
      return q;
    }
  }

  async borraAppointment(cantidad, rangesdate_id) {
    /*
    `SELECT * FROM appointment_entity as apo ` +
    `where (apo.rangedate_id=${rangesdate_id}) and ((status = 'LOCKED') or (status = 'AVAILABLE'))`;
*/

    const apposQryDispo =
      `SELECT * FROM appointment_entity as apo ` +
      `where (apo.rangedate_id=${rangesdate_id}) and (status = 'AVAILABLE')`;
    console.log(apposQryDispo);
    const appos: any = await this.rangesDateRepository.query(apposQryDispo);
    const cantApposDis = appos.length;
    let sumaBorrados = 0;
    let sumaAConfirmar = 0;
    let cantidadABorr = cantidad;
    for (const appo of appos) {
      if (cantidadABorr === 0) {
        break;
      }
      appo.status = 'DELETED';
      console.log({ appo });
      const q = await this.appointmentstatuscontrollerService
        .send<any>({ cmd: 'update-status-controller' }, appo)
        .toPromise();
      cantidadABorr = cantidadABorr - 1;
      sumaBorrados++;
    }
    const apposQryLock =
      `SELECT * FROM appointment_entity as apo ` +
      `where (apo.rangedate_id=${rangesdate_id}) and (status = 'LOCKED')`;
    const apposLock: any = await this.rangesDateRepository.query(apposQryLock);
    const cantApposLock = apposLock.length;
    cantidadABorr = cantidad - cantApposDis;
    if (cantApposDis < cantidad) {
      for (const appoLock of apposLock) {
        if (cantidadABorr === 0) {
          break;
        }
        apposLock.status = 'DELETED';
        console.log({ apposLock });
        const q = await this.appointmentstatuscontrollerService
          .send<any>({ cmd: 'update-status-controller' }, appoLock)
          .toPromise();
        cantidadABorr = cantidadABorr - 1;
        sumaAConfirmar++;
      }
    }
    // cantidad de appos borrada
    /*
    const cantidadDel = cantApposDis >= cantidad ? cantidad : cantApposDis;
    let cantidadDelBl = 0;
    if (cantidad > cantApposDis) {
      cantidadDelBl =
        cantApposLock <= cantidad - cantidadDel
          ? cantApposLock
          : cantidad - cantidadDel;
    }*/
    return sumaAConfirmar;
  }
}
