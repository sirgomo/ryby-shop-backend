import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AktionDto } from 'src/dto/aktion.dto';
import { Aktion } from 'src/entity/aktionEntity';
import { Produkt } from 'src/entity/produktEntity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';

@Injectable()
export class AktionService {
  constructor(
    @InjectRepository(Aktion) private readonly repo: Repository<Aktion>,
  ) {}
  async createAktion(aktionData: Partial<AktionDto>): Promise<Aktion> {
    try {
      if (aktionData.produkt && aktionData.produkt.length > 0) {
        const aktion = this.repo.create(aktionData);
        return await this.repo.save(aktion);
      }
      return await this.repo.manager.transaction(async (enetityMAngeer) => {
        const produkt = await enetityMAngeer.find(Produkt);
        aktionData.produkt = produkt;
        const aktion = await enetityMAngeer.create(Aktion, aktionData);
        return await enetityMAngeer.save(Aktion, aktion);
      });
    } catch (error) {
      throw new Error('Error creating Aktion: ' + error.message);
    }
  }

  async findAll(): Promise<Aktion[]> {
    try {
      return await this.repo.find({
        relations: {
          produkt: true,
        },
        select: {
          produkt: {
            id: true,
          },
        },
      });
    } catch (error) {
      throw new Error('Error finding Aktions: ' + error.message);
    }
  }

  async findOneById(id: number): Promise<Aktion> {
    try {
      return await this.repo.findOneOrFail({
        where: {
          id: id,
        },
        relations: {
          produkt: true,
        },
      });
    } catch (error) {
      throw new Error(`Error finding Aktion with ID ${id}: ${error.message}`);
    }
  }

  async updateAktion(id: number, aktionData: AktionDto): Promise<UpdateResult> {
    try {
      const item = await this.repo.create(aktionData);
      await this.repo.save(item);
      return { raw: '', affected: 1 } as UpdateResult;
    } catch (error) {
      throw new Error(`Error updating Aktion with ID ${id}: ${error.message}`);
    }
  }

  async deleteAktion(id: number): Promise<DeleteResult> {
    try {
      return await this.repo.delete(id);
    } catch (error) {
      throw new Error(`Error deleting Aktion with ID ${id}: ${error.message}`);
    }
  }
  async getPromo(aktion_key: string, produktid: number) {
    try {
      return await this.repo.findOne({
        where: {
          aktion_key: aktion_key,
          produkt: {
            id: produktid,
          },
        },
        relations: {
          produkt: true,
        },
        select: {
          produkt: {
            id: true,
          },
        },
      });
    } catch (err) {
      throw err;
    }
  }
}
