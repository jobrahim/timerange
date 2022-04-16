import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatesModule } from './dates/dates.module';
import { RangesModule } from './ranges/ranges.module';
import { RangesDateModule } from './ranges-date/ranges-date.module';
import { RangeEntity } from './ranges/entities/range.entity';
import { DateEntity } from './dates/entities/date.entity';
import { RangesDateEntity } from './ranges-date/entities/ranges-date.entity';
import { AuthModule } from './auth/auth.module';
import { TimerangeIntegrationModule } from './timerange-integration/timerange-integration.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `env/${process.env.NODE_ENV || 'local'}.env`,
      isGlobal: true,
    }),
    //config typeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'mssql',
        host: config.get('SQL_HOST'),
        port: +config.get('SQL_PORT'),
        username: config.get('SQL_USER'),
        password: config.get('SQL_PASSWORD'),
        database: config.get('SQL_DATABASE'),
        entities: [RangeEntity, DateEntity, RangesDateEntity],
        synchronize: true,
        options: {
          encrypt: false,
        },
      }),
      inject: [ConfigService],
    }),
    //end tyoe orm
    DatesModule,
    RangesModule,
    RangesDateModule,
    AuthModule,
    TimerangeIntegrationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
