import { CreateRangeDto } from './../src/ranges/dto/create-range.dto';
import { CreateDateDto } from './../src/dates/dto/create-date.dto';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { RangesController } from 'src/ranges/ranges.controller';
import { RangesService } from 'src/ranges/ranges.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { MockAuthGuard } from 'src/auth/MockAuthGuard';

describe('Ranges (e2e)', () => {
  let app: INestApplication;
  let rangesController: RangesController;
  let rangesService: RangesService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, AuthModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(MockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    rangesService = moduleFixture.get<RangesService>(RangesService);
    rangesController = moduleFixture.get<RangesController>(RangesController);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/Create Range', async () => {
    const dataTest = {
      start: '10:00',
      end: '11:00',
      operation_id: '1',
    };
    const response = await request(app.getHttpServer())
      .post('/ranges')
      .send(dataTest)
      .expect(201);
  });

  it('/Index Ranges', async () => {
    const ranges = JSON.stringify(await rangesService.index(1));
    return request(app.getHttpServer())
      .get('/ranges/?operation_id=1')
      .expect(200)
      .expect(ranges);
  });

  it('/Update Range', async () => {
    const json = {
      start: '1',
      end: '2',
      operation_id: 1,
    };

    return request(app.getHttpServer()).put('/ranges/1').send(json).expect(200);
  });

  it('/Delete Range', async () => {
    const dataTest = new CreateRangeDto();
    dataTest.operation_id = 1;
    dataTest.start = '10:00';
    dataTest.end = '11:00';

    const newRanges = await rangesService.create(dataTest);

    return request(app.getHttpServer())
      .delete('/ranges/' + newRanges.id)
      .expect(200);
  });
});
