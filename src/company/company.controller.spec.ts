import { Test, TestingModule } from '@nestjs/testing';
import { CompanyController } from './company.controller';
import { HttpException, HttpStatus, INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CompanyDataEntity } from 'src/entity/companyDataEntity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { CompanyService } from './company.service';
import { JwtAuthGuard } from 'src/auth/auth.jwtGuard.guard';

describe('CompanyController (e2e)', () => {
  let app: INestApplication;
  let companyService: CompanyService;
  let companyRepository: Repository<CompanyDataEntity>;
  const request = require("supertest");
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [CompanyController],
      providers: [
        CompanyService,
        {
          provide: getRepositoryToken(CompanyDataEntity),
          useClass: Repository,
        },
      ],
    }).overrideGuard(JwtAuthGuard).useValue({ canActivate: true}).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    companyService = moduleFixture.get<CompanyService>(CompanyService);
    companyRepository = moduleFixture.get<Repository<CompanyDataEntity>>(getRepositoryToken(CompanyDataEntity));
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /company', () => {
    it('should return an array of companies', async () => {
      const companies: CompanyDataEntity[] = [
        {  id: 1, name: 'Company 1',
        company_name: '',
        address: '',
        city: '',
        country: '',
        phone: '',
        email: '',
        isKleinUnternehmen: 0 },
        {  id: 2, name: 'Company 2',
        company_name: '',
        address: '',
        city: '',
        country: '',
        phone: '',
        email: '',
        isKleinUnternehmen: 0},
      ];

      jest.spyOn(companyService, 'getAllCompanies').mockResolvedValue(companies);

      const response = await request(app.getHttpServer()).get('/company');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(companies);
    });

    it('should return an empty array if no companies exist', async () => {
      jest.spyOn(companyService, 'getAllCompanies').mockResolvedValue([]);

      const response = await request(app.getHttpServer()).get('/company');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('GET /company/:id', () => {
    it('should return the company with the specified id', async () => {
      const company: CompanyDataEntity = {
        id: 1, name: 'Company 1',
        company_name: '',
        address: '',
        city: '',
        country: '',
        phone: '',
        email: '',
        isKleinUnternehmen: 0
      };

      jest.spyOn(companyService, 'getCompanyById').mockResolvedValue(company);

      const response = await request(app.getHttpServer()).get('/company/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(company);
    });

    it('should return 404 if the company does not exist', async () => {
      jest.spyOn(companyRepository, 'findOne').mockResolvedValue(null);

      const response = await request(app.getHttpServer()).get('/company/1');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Company not found', statusCode: 404 });
    });
  });

  describe('POST /company', () => {
    it('should create a new company', async () => {
      const companyData: CompanyDataEntity = {
        name: 'New Company',
        id: 0,
        company_name: '',
        address: '',
        city: '',
        country: '',
        phone: '',
        email: '',
        isKleinUnternehmen: 0
      };

      const createdCompany: CompanyDataEntity = {
        id: 1, name: 'New Company',
        company_name: '',
        address: '',
        city: '',
        country: '',
        phone: '',
        email: '',
        isKleinUnternehmen: 0
      };

      jest.spyOn(companyService, 'createCompany').mockResolvedValue(createdCompany);

      const response = await request(app.getHttpServer())
        .post('/company')
        .send(companyData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(createdCompany);
    });
  });

  describe('PUT /company/:id', () => {   
  it('should update the company with the specified id', async () => {
      const companyData: CompanyDataEntity = {
        name: 'Updated Company',
        id: 1,
        company_name: '',
        address: 'asd',
        city: 'asd',
        country: 'asd',
        phone: '',
        email: '',
        isKleinUnternehmen: 0
      };

      const updatedCompany: CompanyDataEntity = {
        id: 1, name: 'Updated Company',
        company_name: '',
        address: 'asd',
        city: 'asd',
        country: 'asd',
        phone: '',
        email: '',
        isKleinUnternehmen: 0
      };

      jest.spyOn(companyRepository, 'findOne').mockResolvedValue(companyData);
      jest.spyOn(companyRepository, 'update').mockResolvedValue({ affected: 1 } as UpdateResult);
      jest.spyOn(companyRepository, 'findOne').mockResolvedValue(updatedCompany);

      const response = await request(app.getHttpServer())
        .put('/company/1')
        .send(companyData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedCompany);
    });
  });

    it('should return 404 if the company does not exist', async () => {
      const companyData: CompanyDataEntity = {
        name: 'Updated Company',
        id: 0,
        company_name: '',
        address: '',
        city: '',
        country: '',
        phone: '',
        email: '',
        isKleinUnternehmen: 0
      };

      jest.spyOn(companyRepository, 'findOne').mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .put('/company/1')
        .send(companyData);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Company not found', statusCode: 404 });
    });
  

  describe('DELETE /company/:id', () => {
    const companyData: CompanyDataEntity = {
      name: 'Updated Company',
      id: 1,
      company_name: '',
      address: '',
      city: '',
      country: '',
      phone: '',
      email: '',
      isKleinUnternehmen: 0
    };

    it('should delete the company with the specified id', async () => {
      jest.spyOn(companyRepository, 'findOne').mockResolvedValue(companyData);
      jest.spyOn(companyRepository, 'delete').mockResolvedValue({ affected: 1 } as DeleteResult);

      const response = await request(app.getHttpServer()).delete('/company/1');

      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual({ affected: 1 } as DeleteResult);
    });

    it('should return 404 if the company does not exist', async () => {
      jest.spyOn(companyRepository, 'findOne').mockRejectedValue(new HttpException('Company not found', HttpStatus.NOT_FOUND));
   

      const response = await request(app.getHttpServer()).delete('/company/1');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Company not found', statusCode: 404 });
    });
  });
});

