import { Test, TestingModule } from '@nestjs/testing';
import { AktionController } from './aktion.controller';
import supertest from 'supertest';
import { Repository } from 'typeorm';
import { Aktion } from 'src/entity/aktionEntity';
import { INestApplication } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/auth.jwtGuard.guard';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Produkt } from 'src/entity/produktEntity';
import { AktionService } from './aktion.service';

describe('AktionController', () => {
  let controller: AktionController;
  let repo: Repository<Aktion>;
  let app: INestApplication;
  let aktion: Aktion;
  beforeEach(async () => {
    aktion = {
      id: 1,
      aktion_key: 'pipa',
      produkt: [{ id: 1 } as Produkt],
      startdatum: undefined,
      enddatum: undefined,
      rabattProzent: 10,
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AktionController],
      providers: [
        {
          provide: getRepositoryToken(Aktion),
          useClass: Repository,
        },
        AktionService,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: true,
      })
      .compile();
    repo = module.get<Repository<Aktion>>(getRepositoryToken(Aktion));
    controller = module.get<AktionController>(AktionController);
    app = module.createNestApplication();
    app.init();
  });
  afterEach(() => {
    app.close();
  });
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  it('/aktion (POST)', () => {
    jest.spyOn(repo, 'create').mockImplementation((ent) => ent as Aktion);
    jest.spyOn(repo, 'save').mockResolvedValueOnce(aktion);
    return supertest(app.getHttpServer())
      .post('/aktion')
      .send({
        ...aktion,
      })
      .expect(201)
      .then((response) => {
        expect(response.body).toEqual(aktion);
      });
  });

  it('/aktion (GET)', () => {
    jest.spyOn(repo, 'find').mockResolvedValueOnce([aktion]);
    return supertest(app.getHttpServer())
      .get('/aktion')
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual([aktion]);
        // Add more detailed tests to check for the structure and data of the response
      });
  });

  it('/aktion/:id (GET)', () => {
    jest.spyOn(repo, 'findOneOrFail').mockResolvedValueOnce(aktion);
    return supertest(app.getHttpServer())
      .get('/aktion/1') // Assuming '1' is a valid ID for an Aktion
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            id: 1,
            // Validate other fields as necessary
          }),
        );
      });
  });

  it('/aktion/:id (PUT)', () => {
    jest.spyOn(repo, 'create').mockImplementation((res) => res as Aktion);
    jest.spyOn(repo, 'save').mockReturnThis();
    return supertest(app.getHttpServer())
      .put('/aktion/1') // Assuming '1' is a valid ID for an Aktion
      .send({
        id: 1,
        aktion_key: 'dupa',
      })
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            raw: '',
            affected: 1,
          }),
        );
      });
  });

  it('/aktion/:id (DELETE)', () => {
    jest.spyOn(repo, 'delete').mockResolvedValueOnce({ raw: '', affected: 1 });
    return supertest(app.getHttpServer())
      .delete('/aktion/1') // Assuming '1' is a valid ID for an Aktion
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            raw: '',
            affected: 1,
          }),
        );
      });
  });
});
