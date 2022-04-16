import { Module } from '@nestjs/common';
import { DatesService } from './dates.service';
import { DatesController } from './dates.controller';
import { DateEntity } from './entities/date.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { RangesDateEntity } from 'src/ranges-date/entities/ranges-date.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { RangesService } from 'src/ranges/ranges.service';
import { RangeEntity } from 'src/ranges/entities/range.entity';

@Module({
  imports: [
    AuthModule,
    ConfigModule,
    TypeOrmModule.forFeature([DateEntity, RangesDateEntity, RangeEntity]),
  ],
  controllers: [DatesController],
  exports: [DatesService, TypeOrmModule, 'FACTORY_TEMPLATE_SERVICE'],
  providers: [
    DatesService,
    RangesService,
    {
      provide: 'FACTORY_TEMPLATE_SERVICE',
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            host: configService.get('FACTORY_TEMPLATE_TCP_HOST'),
            port: configService.get('FACTORY_TEMPLATE_TCP_PORT'),
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
})
export class DatesModule {}
