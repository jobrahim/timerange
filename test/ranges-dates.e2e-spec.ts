import { RangesDateService } from './../src/ranges-date/services/ranges-date.service';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { INestApplication } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { MockAuthGuard } from 'src/auth/mockAuthGuard';
import { RangesDateController } from 'src/ranges-date/ranges-date.controller';
import { RangesDateExportService } from 'src/ranges-date/services/ranges-date-export.service';

describe('RangesDates (e2e)', () => {
  let app: INestApplication;
  let rangesDateController: RangesDateController;
  let rangesDatesService: RangesDateService;
  let rangesDateExportService: RangesDateExportService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, AuthModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(MockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    rangesDatesService =
      moduleFixture.get<RangesDateService>(RangesDateService);
    rangesDateExportService = moduleFixture.get<RangesDateExportService>(
      RangesDateExportService,
    );
    rangesDateController =
      moduleFixture.get<RangesDateController>(RangesDateController);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ranges-date (GET)', async () => {
    const dateList = JSON.stringify(
      await rangesDateExportService.indexExport('1', '2'),
    );
    return request(app.getHttpServer())
      .get('/ranges-date?date=1&operation_id=2')
      .expect(200)
      .expect(dateList);
  });

  it('Toggle Ranges-Dates', async () => {
    const dateTest = {
      date_id: '333',
      range_id: '333',
      quantity: '1',
      status: true,
      qtity: 1,
      ext_user: false,
      operation_id: '1',
    };

    const response = await request(app.getHttpServer())
      .post('/ranges-date')
      .send(dateTest)
      .expect(201);

    request(app.getHttpServer()).put('ranges-date/333/ranges/333').expect(200);

    return request(app.getHttpServer())
      .delete('/dates/' + response.body.result.id)
      .expect(200);
  });
});
