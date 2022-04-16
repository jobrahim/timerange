/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Res,
  HttpStatus,
  UseGuards,
  Req,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { RangesDateService } from './services/ranges-date.service';
import { CreateRangesDateDto } from './dto/create-ranges-date.dto';
import { UpdateRangesDateDto } from './dto/update-ranges-date.dto';
import { RangesDateImportService } from './services/ranges-date-import.service';
import { RangesDateExportService } from './services/ranges-date-export.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UpdateQuantitesExpoDto } from './dto/update-quantities-expo.dto';
import { IndexExportParamsDto } from './dto/indexExportParams.dto';
import { CopyRangeDateParamsDto } from './dto/copyRangeDateParams.dto';
import { ToogleExtUserParamsDto } from './dto/toogleExtUserParams.dto';
import { DateISO8601Dto } from 'src/commons/dtos/dateISO8601.dto';

@Controller('ranges-date')
export class RangesDateController {
  constructor(
    private readonly rangesDateService: RangesDateService,
    private readonly rangesDateImportService: RangesDateImportService,
    private readonly rangesDateExportService: RangesDateExportService,
  ) {}
  @UseGuards(JwtAuthGuard)
  @Post('/')
  create(
    @Body(new ValidationPipe()) createRangesDateDto: CreateRangesDateDto,
    @Res() response,
  ) {
    this.rangesDateService
      .create(createRangesDateDto)
      .then((rangesDate) => {
        response.status(HttpStatus.CREATED).json({
          success: true,
          message: 'La franja horaria se creo con exito',
          result: rangesDate,
        });
      })
      .catch(() => {
        response.status(HttpStatus.FORBIDDEN).json({
          success: false,
          message: 'Error al crear una franja horaria',
        });
      });
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.rangesDateService.findOne(+id);
  // }

  @Delete('/:id')
  remove(@Param('id') id: string) {
    return this.rangesDateService.remove(+id);
  }

  /**
   * Index Ranges of Date Impo
   * Devuelve un listado de franjas horarias de importación, incluyendo:
    • Información de sus yard_blocks con la cantidad de turnos de cada uno.
    • Conteo de bloqueos.
    • Cantidad de cupones por servicio de operaciones coordinables.

    Endpoint: /dates/ranges?date={date}&operation_id={ID de operación}/dates/2021-06-01/ranges
    /dates/ranges?date={date}&operation_id={ID de operación}
   */
  // @Get()
  // indexImport() {
  //   return this.rangesDateImportService.findAll();
  // }

  /**
   * Index Ranges of Date Expo
   * Devuelve un listado de franjas horarias de exportación, incluyendo:
    • Información de los cupos de los contenedores para la franja horaria.
    • Un booleano determinando si acepta o no usuarios externos.
    • Cantidad de cupones por servicio.
    Endpoint: /dates/ranges?date={date}&operation_id={ID de operación}
   */
  @UseGuards(JwtAuthGuard)
  @Get('/')
  indexExport(@Res() res, @Query() params: IndexExportParamsDto) {
    this.rangesDateExportService
      .indexExport(params.date, params.operation_id)
      .then((index) => {
        res.status(HttpStatus.OK).json(index);
      })
      .catch(() => {
        res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
          success: false,
          message: 'Error en el servicio Index Ranges of Dates Expo',
        });
      });
  }
  /**
   * Toggle Range
   * Abre o cierra la franja horaria de un día.
   * Endpoint: /dates/{date}/ranges/{range_id}
   */
  @UseGuards(JwtAuthGuard)
  @Put('/:date/ranges/:range_id')
  toggle(
    @Param('date') date_id: number,
    @Param('range_id') range_id: number,
    @Res() response,
  ) {
    return this.rangesDateService
      .toggle(date_id, range_id)
      .then((rangeDateEntity) => {
        if (rangeDateEntity.id) {
          this.rangesDateService.toggle_appoint(
            date_id,
            range_id,
            rangeDateEntity.status,
          );
          if (rangeDateEntity.status) {
            return response.status(HttpStatus.OK).json({
              success: true,
              message: 'La franja horaria se abrio correctamente',
            });
          } else {
            return response.status(HttpStatus.OK).json({
              success: true,
              message: 'La franja horaria se cerro correctamente',
            });
          }
        } else {
          return response.status(HttpStatus.NOT_FOUND).json({
            success: false,
            message: 'Error al modificar la franja horaria',
          });
        }
      });
  } /*

  /**
   * Update Quantities Impo
   * Actualiza los valores de los yard_block para importación.
   * El endpoint obtiene un listado de cambios a realizar, cada cambio incluye los IDs de la franja horaria, el bloque y estiba, y el nuevo valor (cantidad de turnos).
   * En la respuesta, el endpoint debe devolver un estado por cada cambio enviado.
Puede darse la situación de que:
    • Teniendo un yard_block con un quantity de 20.
    • Se pide un cambio a un quantity de 50.
    • Por alguna restricción no se puede otorgar más de 30 turnos a ese yard_block.
    • En ese caso, el endpoint asigna el máximo de turnos disponibles (en este caso 30) y devuelve un estado informando que no se pueden alocar los turnos pedidos.

    Endpoint: /dates/{date}/ranges
   */
  @Put('/:id')
  updateQuantityImport(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateRangesDateDto: UpdateRangesDateDto,
  ) {
    return this.rangesDateImportService.update(+id, updateRangesDateDto);
  }

  /**
   * Update Quantities Expo
   * Actualiza los valores de los cupos de contenedores para expo.
   * El endpoint obtiene un listado de cambios a realizar, cada cambio incluye los IDs de la franja horaria, el ID del tipo de contenedor, y el nuevo valor (cantidad de turnos)
   *     En la respuesta, el endpoint debe devolver un estado por cada cambio enviado al igual que en la actualización de Importación.
   * Endpoint: /dates/{date}/ranges
   */
  @UseGuards(JwtAuthGuard)
  @Put('/:date/export')
  async updateQuantityExport(
    @Param() { date }: DateISO8601Dto,
    @Body(new ValidationPipe()) updateQuantitesExpoDto: UpdateQuantitesExpoDto,
    @Res() res,
  ) {
    try {
      const updates = await this.rangesDateExportService.updateQuantitiesExpo(
        date,
        updateQuantitesExpoDto,
      );
      return res.status(HttpStatus.OK).json(updates);
    } catch (e) {
      throw e;
    }
  }

  /**
   * Update External Users of Range Expo
   * Actualiza el booleano de usuarios externos de los rangos de exportación
   * Endpoint: /ranges-date/{date}/ranges/{range_id}/ext_users
   */
  @UseGuards(JwtAuthGuard)
  @Put('/:date/ranges/:range_id/ext_users')
  async toggleExtUser(
    @Param() { date, range_id }: ToogleExtUserParamsDto,
    @Res() response,
  ) {
    try {
      const rangeDateEntity = await this.rangesDateExportService.toggle(
        date,
        range_id,
      );
      if (rangeDateEntity.ext_user === true) {
        response.status(HttpStatus.OK).json({
          success: true,
          message: 'Usuario externo habilitado correctamente',
          ext_user: rangeDateEntity.ext_user,
        });
      } else if (rangeDateEntity.ext_user === false) {
        response.status(HttpStatus.OK).json({
          success: true,
          message: 'Usuario externo inhabilitado correctamente',
          ext_user: rangeDateEntity.ext_user,
        });
      }
    } catch (e) {
      throw e;
    }
  }

  /**
   * Copia una franja horaria a otra
   * Endpoint: /ranges
   */
  @UseGuards(JwtAuthGuard)
  @Post('/ranges_date_copy')
  async copRangeDate(
    @Res() response,
    @Body(new ValidationPipe()) copyRxDParamsDto: CopyRangeDateParamsDto,
  ) {
    console.log('Entre');
    const { originId, destinosId } = copyRxDParamsDto;
    console.log('destinosId-> ' + destinosId);

    try {
      const rangeDate = await this.rangesDateService.copyRxD(
        originId,
        destinosId,
      );
      console.log('Controller: ' + rangeDate);
      if (rangeDate) {
        response.status(HttpStatus.OK).json({
          success: true,
          message: 'Ranges Dates actaulizados correctamente',
          actualizados: rangeDate,
        });
      } else if (!rangeDate) {
        response.status(HttpStatus.OK).json({
          success: true,
          message: 'Usuario externo inhabilitado correctamente',
        });
      }
    } catch (e) {
      throw e;
    }
  }
}
