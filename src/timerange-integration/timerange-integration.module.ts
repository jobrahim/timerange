import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatesModule } from 'src/dates/dates.module';
import { RangesDateModule } from 'src/ranges-date/ranges-date.module';
import { RangesModule } from 'src/ranges/ranges.module';
import { TimerangeIntegrationController } from './timerange-integration.controller';
import { TimerangeIntegrationService } from './timerange-integration.service';

@Module({
  imports: [ConfigModule, DatesModule, RangesModule, RangesDateModule],
  controllers: [TimerangeIntegrationController],
  providers: [TimerangeIntegrationService],
})
export class TimerangeIntegrationModule {}
