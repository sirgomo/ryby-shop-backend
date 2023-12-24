import { Test, TestingModule } from '@nestjs/testing';
import { BestellungenController } from './bestellungen.controller';
import { INestApplication } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Produkt } from 'src/entity/produktEntity';
import { Bestellung } from 'src/entity/bestellungEntity';
import request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtAuthGuard } from 'src/auth/auth.jwtGuard.guard';

describe('BestellungenController', () => {
  let controller: BestellungenController;
  let app: INestApplication;
  let productRepo: Repository<Produkt>;
  let bestellungRepo: Repository<Bestellung>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BestellungenController],
      providers: [
        {
          provide: getRepositoryToken(Produkt),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Bestellung),
          useClass: Repository,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: true })
      .compile();

    controller = module.get<BestellungenController>(BestellungenController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
