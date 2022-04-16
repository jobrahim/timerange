import { Module } from '@nestjs/common';
import { RangesService } from './ranges.service';
import { RangesController } from './ranges.controller';
import { AuthModule } from 'src/auth/auth.module';
import { RangeEntity } from './entities/range.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RangesDateEntity } from 'src/ranges-date/entities/ranges-date.entity';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([RangeEntity, RangesDateEntity]),
  ],
  controllers: [RangesController],
  providers: [RangesService],
  exports: [RangesService, TypeOrmModule],
})
export class RangesModule {}
