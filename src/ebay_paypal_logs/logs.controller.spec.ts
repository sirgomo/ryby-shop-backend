import { Test, TestingModule } from '@nestjs/testing';
import { LogsController } from './logs.controller';
import { LogsService } from './logs.service';
import { Repository } from 'typeorm';
import { LogsEntity } from 'src/entity/logsEntity';
import { getRepositoryToken } from '@nestjs/typeorm';
import supertest from 'supertest';
import { INestApplication } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/auth.jwtGuard.guard';

describe('LogsController', () => {
  let controller: LogsController;
  let repo: Repository<LogsEntity>;
  let errors: LogsEntity[] = [];
  let app: INestApplication;

  beforeEach(async () => {
    setTestData();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LogsController],
      providers: [
        LogsService,
        {
          provide: getRepositoryToken(LogsEntity),
          useClass: Repository,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: true })
      .compile();
    app = module.createNestApplication();
    repo = module.get<Repository<LogsEntity>>(getRepositoryToken(LogsEntity));
    controller = module.get<LogsController>(LogsController);
    await app.init();
  });
  afterEach(() => {
    app.close();
  });
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  it('should get all errors', async () => {
    jest.spyOn(repo, 'findAndCount').mockResolvedValueOnce([errors, 1]);

    const requ = await supertest(app.getHttpServer())
      .get('/logs/null/3/5')
      .expect(200);

    expect(requ.body).toEqual([errors, 1]);
  });
  it('should get all errors by class', async () => {
    jest
      .spyOn(repo, 'find')
      .mockResolvedValueOnce(
        errors.filter((ent) => ent.error_class === 'klasa'),
      );

    const requ = await supertest(app.getHttpServer())
      .get('/logs/class/klasa')
      .expect(200);

    expect(requ.body).toEqual([errors[0]]);
  });
  it('should get all errors by id', async () => {
    jest.spyOn(repo, 'findOne').mockImplementationOnce((id) => {
      return Promise.resolve(
        errors.filter((er) => er.id === Object(id.where).id)[0],
      );
    });

    const requ = await supertest(app.getHttpServer())
      .get('/logs/2')
      .expect(200);

    expect(requ.body).toEqual(errors[1]);
  });
  function setTestData() {
    errors = [];
    const err: LogsEntity = {
      id: 1,
      ebay_transaction_id: 'kasjdhkjashdhj',
      user_email: '',
      paypal_transaction_id: '',
      error_class: 'klasa',
      error_message: 'pipa',
      created_at: '2202-05-01' as unknown as Date,
    };
    const err2: LogsEntity = {
      id: 2,
      ebay_transaction_id: '',
      user_email: 'ajksdhaksjd',
      paypal_transaction_id: 'asmkld',
      error_class: 'klas',
      error_message: 'message',
      created_at: '2202-05-01' as unknown as Date,
    };
    errors = [err, err2];
  }
});
