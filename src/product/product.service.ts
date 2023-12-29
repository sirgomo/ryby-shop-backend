import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductDto } from 'src/dto/product.dto';
import { EanEntity } from 'src/entity/eanEntity';
import { Produkt } from 'src/entity/produktEntity';
import { DeleteResult, Like, MoreThan, Repository } from 'typeorm';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Produkt)
    private produktRepository: Repository<Produkt>,
    @InjectRepository(EanEntity)
    private readonly eanRepo: Repository<EanEntity>,
  ) {}

  async getAllProdukte(
    search: string,
    katid: number,
    pagecount: number,
    pagenr: number,
  ): Promise<[Produkt[], number]> {
    if (!isFinite(pagenr) || pagenr < 1) pagenr = 1;
    const start = pagecount * pagenr - pagecount;
    const end = pagecount * pagenr;
    try {
      if (search != 'null' && katid != 0) {
        return await this.produktRepository
          .findAndCount({
            where: {
              name: Like(`%${search}%`),
              kategorie: {
                id: katid,
              },
            },
            relations: {
              kategorie: true,
              variations: true,
            },
            take: end,
            skip: start,
          })
          .catch((err) => {
            console.log(err);
            return err;
          });
      } else if (search != 'null' && katid == 0) {
        return await this.produktRepository
          .findAndCount({
            where: {
              name: Like(`%${search}%`),
            },
            relations: {
              variations: true,
            },
            take: end,
            skip: start,
          })
          .catch((err) => {
            console.log(err);
            return err;
          });
      } else if (search == 'null' && katid != 0) {
        return await this.produktRepository
          .findAndCount({
            where: {
              kategorie: {
                id: katid,
              },
            },
            relations: {
              kategorie: true,
              variations: true,
            },
            take: end,
            skip: start,
          })
          .catch((err) => {
            console.log(err);
            return err;
          });
      }

      return await this.produktRepository.findAndCount({
        relations: {
          variations: true,
        },
        take: end,
        skip: start,
      });
    } catch (error) {
      throw new HttpException(
        'Fehler beim Abrufen der Produkte',
        HttpStatus.NOT_FOUND,
      );
    }
  }
  async getAllProdukteForKunden(
    search: string,
    katid: number,
    pagecount: number,
    pagenr: number,
  ): Promise<[Produkt[], number]> {
    if (!isFinite(pagenr) || pagenr < 1) pagenr = 1;
    const start = pagecount * pagenr - pagecount;
    const end = pagecount * pagenr;

    try {
      if (search != 'null' && katid != 0) {
        return await this.produktRepository
          .findAndCount({
            where: {
              name: Like(`%${search}%`),
              kategorie: {
                id: katid,
              },
              verfgbarkeit: 1,
              variations: {
                quanity: MoreThan(0),
              },
            },
            relations: {
              kategorie: true,
              promocje: true,
              variations: true,
              shipping_costs: true,
            },
            take: end,
            skip: start,
          })
          .catch((err) => {
            console.log(err);
            return err;
          });
      } else if (search != 'null' && katid == 0) {
        return await this.produktRepository
          .findAndCount({
            where: {
              name: Like(`%${search}%`),
              verfgbarkeit: 1,
              variations: {
                quanity: MoreThan(0),
              },
            },
            relations: {
              promocje: true,
              variations: true,
              shipping_costs: true,
            },
            take: end,
            skip: start,
          })
          .catch((err) => {
            console.log(err);
            return err;
          });
      } else if (search == 'null' && katid != 0) {
        return await this.produktRepository
          .findAndCount({
            where: {
              kategorie: {
                id: katid,
              },
              verfgbarkeit: 1,
              variations: {
                quanity: MoreThan(0),
              },
            },
            relations: {
              kategorie: true,
              promocje: true,
              variations: true,
              shipping_costs: true,
            },
            take: end,
            skip: start,
          })
          .catch((err) => {
            console.log(err);
            return err;
          });
      }

      return await this.produktRepository.findAndCount({
        where: {
          verfgbarkeit: 1,
          variations: {
            quanity: MoreThan(0),
          },
        },
        relations: {
          variations: true,
          shipping_costs: true,
        },
        take: end,
        skip: start,
      });
    } catch (error) {
      throw new HttpException(
        'Fehler beim Abrufen der Produkte',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async getProduktById(id: number): Promise<Produkt> {
    try {
      return await this.produktRepository
        .findOne({
          where: {
            id: id,
            variations: {
              quanity: MoreThan(0),
            },
          },
          relations: {
            bestellungen: true,
            lieferant: true,
            kategorie: true,
            wareneingang: true,
            promocje: true,
            bewertung: true,
            eans: true,
            variations: true,
            shipping_costs: true,
          },
        })
        .then((res) => {
          if (!res)
            throw new HttpException('Produkt not found', HttpStatus.NOT_FOUND);

          return res;
        })
        .catch((err) => {
          console.log(err);
          throw err;
        });
    } catch (error) {
      throw new HttpException('Produkt not found', HttpStatus.NOT_FOUND);
    }
  }
  async getAdminProduktById(id: number): Promise<Produkt> {
    try {
      return await this.produktRepository
        .findOne({
          where: { id: id },
          relations: {
            bestellungen: true,
            lieferant: true,
            kategorie: true,
            wareneingang: true,
            promocje: true,
            bewertung: true,
            eans: true,
            variations: true,
            shipping_costs: true,
          },
        })
        .catch((err) => {
          console.log(err);
          throw err;
        });
    } catch (error) {
      throw new HttpException(
        'Fehler beim Abrufen der Produkte',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async createProdukt(productDto: ProductDto): Promise<Produkt> {
    try {
      const produkt = await this.produktRepository.create(productDto);

      return await this.produktRepository.save(produkt);
    } catch (error) {
      throw new HttpException(
        'Fehler beim Erstellen des Produkts',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async updateProdukt(id: number, productDto: ProductDto): Promise<Produkt> {
    try {
      const produkt = await this.produktRepository.findOne({
        where: { id: id },
        relations: {
          eans: true,
          variations: true,
        },
      });
      if (!produkt) {
        throw new HttpException('Produkt nicht gefunden', HttpStatus.NOT_FOUND);
      }

      const merged = await this.produktRepository.merge(produkt, productDto);

      return await this.produktRepository.save(merged);
    } catch (error) {
      console.log(error);
      throw new HttpException('Produkt nicht gefunden', HttpStatus.NOT_FOUND);
    }
  }

  async deleteProdukt(id: number): Promise<DeleteResult> {
    try {
      const item = await this.produktRepository.findOne({
        where: {
          id: id,
        },
        relations: {
          variations: true,
        },
      });
      if (item)
        for (let i = 0; i < item.variations.length; i++) {
          if (item.variations[i].quanity > 0)
            throw new HttpException(
              'Produkt ' +
                item.name +
                ' kann nicht gelöscht werden, die Menge ist gößer als 0 ',
              HttpStatus.BAD_REQUEST,
            );
        }
      else {
        throw new HttpException('Produkt not found', HttpStatus.BAD_REQUEST);
      }

      return await this.produktRepository.delete(id).catch((err) => {
        console.log(err);
        throw new HttpException(
          'Fehler beim Löschen des Produkts',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      });
    } catch (error) {
      return error;
    }
  }

  async getProduktsForBuchung(lieferantId: number) {
    try {
      if (lieferantId === 0) {
        return await this.produktRepository.find();
      }
      return await this.produktRepository.find({
        where: {
          lieferant: {
            id: lieferantId,
          },
        },
        relations: {
          lieferant: true,
          variations: true,
        },
      });
    } catch (err) {
      return new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }
  async deleteEan(id: number): Promise<DeleteResult> {
    try {
      return await this.eanRepo.delete({ id: id });
    } catch (err) {
      throw err;
    }
  }
  //get item by sku
  async getProduktBeiSku(sku: string) {
    try {
      return await this.produktRepository
        .findOne({
          where: { sku: sku },
          relations: {
            variations: true,
          },
        })
        .catch((err) => {
          console.log(err);
          throw err;
        })
        .then((res) => {
          if (res) return { sku: res.sku };

          return { sku: 'null' };
        });
    } catch (err) {
      console.log(err);
      return err;
    }
  }
  //get item by qby_grop (its sku to but for group, ebay return it as ebay_group id)
  async getProduktBeiEbayGroup(ebay_group: string) {
    try {
      return await this.produktRepository
        .findOne({
          where: { sku: ebay_group },
          relations: {
            variations: true,
          },
        })
        .then((res) => {
          if (res) return { sku: res.sku };

          return { sku: 'null' };
        })
        .catch((err) => {
          console.log(err);
          throw err;
        });
    } catch (err) {
      return err;
    }
  }
  async getProductsForSitemap() {
    try {
      const items = await this.produktRepository.find({
        select: {
          id: true,
          name: true,
        },
      });

      return items;
    } catch (err) {
      throw new HttpException(
        'Products für Sitemap wurden nicht gefunden',
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
