import { Module } from '@nestjs/common';
import { RangesDateService } from './services/ranges-date.service';
import { RangesDateController } from './ranges-date.controller';
import { AuthModule } from 'src/auth/auth.module';
import { RangesDateExportService } from './services/ranges-date-export.service';
import { RangesDateImportService } from './services/ranges-date-import.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RangesDateEntity } from './entities/ranges-date.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DateEntity } from 'src/dates/entities/date.entity';
import { RangeEntity } from 'src/ranges/entities/range.entity';
import { DatesService } from 'src/dates/dates.service';
import { DatesModule } from 'src/dates/dates.module';
import { RangesModule } from 'src/ranges/ranges.module';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    AuthModule,
    DatesModule,
    RangesModule,
    TypeOrmModule.forFeature([RangesDateEntity, DateEntity, RangeEntity]),
  ],
  controllers: [RangesDateController],
  providers: [
    RangesDateService,
    RangesDateImportService,
    RangesDateExportService,
    DatesService,
    {
      provide: 'RESOURCE_SERVICE',
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            host: configService.get('RESOURCE_TCP_HOST'),
            port: configService.get('RESOURCE_TCP_PORT'),
          },
        });
      },
      inject: [ConfigService],
    },
    {
      provide: 'LIMITS_SERVICE',
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            host: configService.get('LIMITS_TCP_HOST'),
            port: configService.get('LIMITS_TCP_PORT'),
          },
        });
      },
      inject: [ConfigService],
    },
    {
      provide: 'APPOINTMENTS_SERVICE',
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            host: configService.get('APPOINTMENTS_TCP_HOST'),
            port: configService.get('APPOINTMENTS_TCP_PORT'),
          },
        });
      },
      inject: [ConfigService],
    },
    {
      provide: 'LOCK_SERVICE',
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            host: configService.get('LOCK_TCP_HOST'),
            port: configService.get('LOCK_TCP_PORT'),
          },
        });
      },
      inject: [ConfigService],
    },
    {
      provide: 'SHIFTS_BOOKING_SERVICE',
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            host: configService.get('SHIFTS_BOOKING_TCP_HOST'),
            port: configService.get('SHIFTS_BOOKING_TCP_PORT'),
          },
        });
      },
      inject: [ConfigService],
    },
    {
      provide: 'APPOINTMENT_STATUS_CONTROLLER_SERVICE',
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            host: configService.get('APPOINTMENT_STATUS_CONTROLLER_TCP_HOST'),
            port: configService.get('APPOINTMENT_STATUS_CONTROLLER_TCP_PORT'),
          },
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [RangesDateService, TypeOrmModule],
})
export class RangesDateModule {}
