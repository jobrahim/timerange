import { response } from 'express';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { DatesService } from 'src/dates/dates.service';
import { DatesController } from 'src/dates/dates.controller';
import { INestApplication } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { MockAuthGuard } from 'src/auth/mockAuthGuard';

describe('Dates (e2e)', () => {
  let app: INestApplication;
  let datesController: DatesController;
  let datesService: DatesService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, AuthModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(MockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    datesService = moduleFixture.get<DatesService>(DatesService);
    datesController = moduleFixture.get<DatesController>(DatesController);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/dates (POST)', async () => {
    const dateTest = {
      value: '20210830T00:00:00',
      status: 'OPEN',
      operationId: 123,
    };
    const response = await request(app.getHttpServer())
      .post('/dates')
      .send(dateTest)
      .expect(201);
  });

  it('/dates (GET)', async () => {
    const dateList = JSON.stringify(await datesService.findAll());

    return request(app.getHttpServer())
      .get('/dates')
      .expect(200)
      .expect(dateList);
  });

  it('Toggle Date', async () => {
    const dateTest = {
      value: '19900830T00:00:00',
      status: 'OPEN',
      operationId: 123,
    };
    const response = await request(app.getHttpServer())
      .post('/dates')
      .send(dateTest)
      .expect(201);

    request(app.getHttpServer())
      .put('/dates/19900830T00:00:00/operation/123/toggle')
      .expect(200);

    return request(app.getHttpServer())
      .delete('/dates/' + response.body.result.id)
      .expect(200);
  });

  it('Update Limits Impo/Expo', async () => {
    const json = {
      operation_id: '1',
      limits: [
        {
          range_id: 1,
          service_id: 1,
          value: 10,
        },
      ],
    };

    return request(app.getHttpServer())
      .put('/dates/1/limits')
      .send(json)
      .expect(200);
  });
});
