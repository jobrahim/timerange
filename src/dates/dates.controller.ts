import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Res,
  HttpStatus,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { DateISO8601Dto } from 'src/commons/dtos/dateISO8601.dto';
import { DatesService } from './dates.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { CreateDateDto } from './dto/create-date.dto';
import { UpdateLimitIEResponseDto } from './dto/update-limit-ie-response.dto';
import { UpdateLimitImpoExpoDto } from './dto/update-limit-impo-expo.dto';
import { ToogleDateParamsDto } from './dto/toggleDateParams.dto';
import { ImplementTemplateParamsDto } from './dto/implementTemplateParams.dto';
import { StatusDateUpdate } from 'src/commons/enums/status-date-update.enum';

@Controller('dates')
export class DatesController {
  constructor(private readonly datesService: DatesService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/')
  create(
    @Body(new ValidationPipe()) createDateDto: CreateDateDto,
    @Res() response,
  ) {
    this.datesService
      .create(createDateDto)
      .then((date) => {
        response.status(HttpStatus.CREATED).json({
          success: true,
          message: 'Se creo una fecha exitosamente',
          result: date,
        });
      })
      .catch((e) => {
        response.status(HttpStatus.FORBIDDEN).json({
          success: false,
          message: 'Error al crear una fecha',
          error: e,
        });
      });
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  findOne(@Param('id') id: string) {
    return this.datesService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/')
  findAll() {
    return this.datesService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  remove(@Param('id') id: string) {
    return this.datesService.remove(+id);
  }

  /**
   * Toggle Date
    Abre o cierra una fecha
    Endpoint: /dates/{date}/toggle
   */
  @UseGuards(JwtAuthGuard)
  @Put('/:date/operation/:operation/toggle')
  async toggle(
    @Param() { date, operation }: ToogleDateParamsDto,
    @Res() response,
  ) {
    try {
      const dateEntity = await this.datesService.toggle(date, operation);
      if (dateEntity.id) {
        if (dateEntity.status === StatusDateUpdate.OPEN) {
          // Buscar si existen appointments creados para esta fecha
          const appos = await this.datesService.findAppointmentByDateID(
            dateEntity.id,
          );
          if (appos.length == 0) {
            // Se crean appointments
            await this.datesService.c_appointment(date, operation);
          }
          return response.status(HttpStatus.OK).json({
            success: true,
            message: 'La fecha se abrio correctamente',
            status: dateEntity.status,
          });
        } else {
          return response.status(HttpStatus.OK).json({
            success: true,
            message: 'La fecha se cerro correctamente',
            status: dateEntity.status,
          });
        }
      } else {
        return response
          .status(HttpStatus.NOT_FOUND)
          .json({ success: false, message: 'Error al modificar una fecha' });
      }
    } catch (e) {
      throw e;
    }
  }

  /**
   * Implement Template
   * Copia los valores de un template al día enviado
   * Endpoint: /dates/{date}/template/{_id}
   */
  @UseGuards(JwtAuthGuard)
  @Put('/:dateValue/template/:templateId')
  async template(
    @Param() { dateValue, templateId }: ImplementTemplateParamsDto,
    @Res() response,
  ) {
    try {
      const responseJson = await this.datesService.template(
        new CreateAppointmentDto(templateId, dateValue),
      );
      response.status(HttpStatus.OK).json(responseJson);
    } catch (e) {
      response.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: 'Error al implementar un template',
        error: e,
      });
    }
  }

  /**
    Update Limits Impo/Expo
    Actualiza la cantidad de cupones para los servicios de un día
    El endpoint obtiene un listado de cambios a realizar, cada cambio incluye los IDs de la franja horaria, los IDs del servicio, y el nuevo valor (cantidad de cupones).
    En la respuesta, el endpoint debe devolver un estado por cada cambio enviado.
    Puede darse la situación de que:
    Teniendo un servicio con una cantidad de 20 cupones.
    Se pide un cambio a una cantidad de 50.
    Por alguna restricción no se puede otorgar más de 30 cupones a ese servicio.
    En ese caso, el endpoint asigna el máximo de cupones disponibles (en este caso 30) y devuelve un estado informando que no se pueden aplicar los cupones pedidos.
/**
* @param id
* @param updateRangeDto
* @returns
*/

  @UseGuards(JwtAuthGuard)
  @Put('/:date/limits')
  async UpdateLimitsOfDate(
    @Param() { date }: DateISO8601Dto,
    @Body(new ValidationPipe()) updateLimitImpoExpo: UpdateLimitImpoExpoDto,
    @Res() res,
  ) {
    try {
      const lim = await this.datesService.UpdateLimitsOfDate(
        date,
        updateLimitImpoExpo,
      );

      return res.status(HttpStatus.OK).json(lim);
    } catch (e) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: 'Error al actualizar el limite de cupos',
      });
    }
  }
}
