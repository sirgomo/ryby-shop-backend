import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/auth.jwtGuard.guard';
import { CompanyDataEntity } from 'src/entity/companyDataEntity';
import { CompanyService } from './company.service';
import { DeleteResult } from 'typeorm';

@Controller('company')
export class CompanyController {
  constructor(private companyService: CompanyService) {}

  @Get()
  async getAllCompanies(): Promise<CompanyDataEntity[]> {
    return await this.companyService.getAllCompanies();
  }

  @Get(':id')
  async getCompanyById(@Param('id') id: number): Promise<CompanyDataEntity> {
    return await this.companyService.getCompanyById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createCompany(
    @Body() companyData: CompanyDataEntity,
  ): Promise<CompanyDataEntity> {
    return await this.companyService.createCompany(companyData);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateCompany(
    @Param('id') id: number,
    @Body() companyData: CompanyDataEntity,
  ): Promise<CompanyDataEntity> {
    return await this.companyService.updateCompany(id, companyData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteCompany(@Param('id') id: number): Promise<DeleteResult> {
    return await this.companyService.deleteCompany(id);
  }
  @Get('cookie/get')
  async getCookies() {
    return await this.companyService.getCookies();
  }
  @Post('urlop/post')
  async setUrlop(@Body() company: Partial<CompanyDataEntity>) {
    return await this.companyService.setUrlop(company);
  }
  @Get('urlop/get')
  async getIsInUrlop() {
    return await this.companyService.getUrlop();
  }
}
