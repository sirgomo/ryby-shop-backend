import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CompanyDataEntity } from 'src/entity/companyDataEntity';
import { DeleteResult, Repository } from 'typeorm';
import { UpdateResult } from 'typeorm/browser';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(CompanyDataEntity)
    private companyRepository: Repository<CompanyDataEntity>,
  ) {}

  async getAllCompanies(): Promise<CompanyDataEntity[]> {
    try {
      return await this.companyRepository.find();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async getCompanyById(id: number): Promise<CompanyDataEntity> {
    try {
      const item = await this.companyRepository.findOne({
        where: { id: id },
        select: {
          isKleinUnternehmen: true,
        },
      });
      if (!item)
        throw new HttpException('Company not found', HttpStatus.NOT_FOUND);

      return item;
    } catch (error) {
      throw error;
    }
  }

  async createCompany(
    companyData: Partial<CompanyDataEntity>,
  ): Promise<CompanyDataEntity> {
    try {
      const ent = await this.companyRepository.create(companyData);
      ent.id = null;
      return await this.companyRepository.save(ent).catch((err) => {
        console.log(err);
        return err;
      });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async updateCompany(
    id: number,
    companyData: Partial<CompanyDataEntity>,
  ): Promise<CompanyDataEntity> {
    try {
      const company = await this.companyRepository.findOne({
        where: { id: id },
      });
      if (!company) {
        throw new HttpException('Company not found', HttpStatus.NOT_FOUND);
      }
      await this.companyRepository.update(id, companyData);
      return await this.companyRepository.findOne({ where: { id: id } });
    } catch (error) {
      throw error;
    }
  }

  async deleteCompany(id: number): Promise<DeleteResult> {
    try {
      const company = await this.companyRepository.findOne({
        where: { id: id },
      });
      if (!company) {
        throw new HttpException('Company not found', HttpStatus.NOT_FOUND);
      }
      return await await this.companyRepository.delete(id);
    } catch (error) {
      throw error;
    }
  }
  async getCookies(): Promise<CompanyDataEntity> {
    try {
      return await this.companyRepository.findOne({
        where: { id: 1 },
        select: {
          id: true,
          cookie_info: true,
        },
      });
    } catch (err) {
      console.log(err);
      throw new HttpException('Cookies not found', HttpStatus.NOT_FOUND);
    }
  }
  async getUrlop(): Promise<CompanyDataEntity[]> {
    try {
      return await this.companyRepository.find({
        select: {
          is_in_urlop: true,
          urlop_from: true,
          urlop_to: true,
        },
      });
    } catch (err) {
      console.log(err);
      throw new Error(err.message);
    }
  }
  async setUrlop(company: Partial<CompanyDataEntity>): Promise<UpdateResult> {
    try {
      return await this.companyRepository.update({ id: company.id }, company);
    } catch (err) {
      console.log(err);
      throw new Error(err.message);
    }
  }
}
