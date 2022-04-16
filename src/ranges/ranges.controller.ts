import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  Res,
  UseGuards,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { RangesService } from './ranges.service';
import { CreateRangeDto } from './dto/create-range.dto';
import { UpdateRangeDto } from './dto/update-range.dto';
import { Req } from '@nestjs/common/decorators/http';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('ranges')
export class RangesController {
  constructor(private readonly rangesService: RangesService) {}

  /**
   * Create Range
   * Crea una franja horaria
   * Endpoint: /ranges
   * @param createRangeDto
   * @returns
   */

  @UseGuards(JwtAuthGuard)
  @Post('/')
  create(
    @Body(new ValidationPipe()) createRangeDto: CreateRangeDto,
    @Res() response,
  ) {
    this.rangesService
      .create(createRangeDto)
      .then((range) => {
        response.status(HttpStatus.CREATED).json({
          success: true,
          message: 'La franja horaria se creo con exito',
          result: range,
        });
      })
      .catch((e) => {
        response.status(HttpStatus.FORBIDDEN).json({
          success: false,
          message: 'Error al crear la franja horaria',
        });
      });
  }

  /**
   * Index Ranges by ID
   * Retorna la franja horaria
   * @param id
   * @returns
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Res() response) {
    this.rangesService
      .findOne(+id)
      .then((range) => {
        return response.status(HttpStatus.OK).json({ result: range });
      })
      .catch((e) => {
        return response.status(HttpStatus.FORBIDDEN).json({
          success: false,
          message: 'Error al obtener una franja horaria',
        });
      });
  }

  /**
   * Update Range
   * Actualiza una franja horaria
   *
   * @param id
   * @param updateRangeDto
   * @returns
   */
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateRangeDto: UpdateRangeDto,
    @Res() response,
  ) {
    this.rangesService
      .update(+id, updateRangeDto)
      .then((updateRange) => {
        if (updateRange.affected > 0) {
          return response.status(HttpStatus.OK).json({
            success: true,
            message: 'La franja horaria se modifico con exito',
          });
        } else {
          return response
            .status(HttpStatus.NOT_FOUND)
            .json({ success: false, message: 'La franja horaria no existe' });
        }
      })
      .catch(() => {
        return response.status(HttpStatus.FORBIDDEN).json({
          success: false,
          message: 'Error al modificar una franja horaria',
        });
      });
  }

  /**
   * Delete Range
   * Elimina una franja horaria
   * @param id
   * @returns
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Res() response) {
    this.rangesService
      .remove(+id)
      .then((removeRange) => {
        if (removeRange.affected > 0) {
          return response.status(HttpStatus.OK).json({
            success: true,
            message: 'La franja horaria se elimino correctamente',
          });
        } else {
          return response
            .status(HttpStatus.NOT_FOUND)
            .json({ success: false, message: 'La franja horaria no existe' });
        }
      })
      .catch(() => {
        return response.status(HttpStatus.FORBIDDEN).json({
          success: false,
          message: 'Error al modificar una franja horaria',
        });
      });
  }

  /**
   * Index Ranges
   * Devuelve un listado de franjas horarias
   * Endpoint: /ranges?operation_id={ID de operación}
   */
  @UseGuards(JwtAuthGuard)
  @Get('/')
  indexRanges(@Req() req, @Res() res, @Query() params) {
    this.rangesService.index(params.operation_id).then((range) => {
      return res.status(HttpStatus.OK).json(range);
    });
  }
}
