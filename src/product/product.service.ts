import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductDto } from 'src/dto/product.dto';
import { Produkt } from 'src/entity/produktEntity';
import { DeleteResult, Like, Repository } from 'typeorm';

@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(Produkt)
        private produktRepository: Repository<Produkt>,
      ) {}
    
      async getAllProdukte(search: string, katid: number, pagecount: number, pagenr: number): Promise<Produkt[]> {
        if(!isFinite(pagenr) || pagenr < 1)
        pagenr = 1;
        const start = pagecount * pagenr - pagecount;
        const end = pagecount * pagenr;
        try {
          if(search != 'null' && katid != 0) {
                  return await this.produktRepository.find({ where: {
                    name: Like(`%${search}%`),
                    kategorie: {
                      id: katid
                    }
                  },
                relations: {
                  kategorie: true
                },
                take: end, 
                skip: start,
              }).catch(err => {
                console.log(err)
                return err;
              })
        } else if ( search != 'null' && katid == 0) {
          console.log(search)
                return await this.produktRepository.find({ where: {
                  name: Like(`%${search}%`),
                },
              take: end, 
              skip: start,
            }).catch(err => {
              console.log(err)
              return err;
            })
        } else if (search == 'null' && katid  != 0) {
          return await this.produktRepository.find({ where: {
            kategorie: {
              id: katid
            }
          },
        relations: {
          kategorie: true
        },
        take: end, 
        skip: start,
      }).catch(err => {
        console.log(err)
        return err;
      })
        }
           

          return await this.produktRepository.find();
        } catch (error) {
            throw new HttpException('Fehler beim Abrufen der Produkte', HttpStatus.NOT_FOUND);
        }
      }
    
      async getProduktById(id: number): Promise<Produkt> {
        try {
          return await this.produktRepository.findOne({where: { id: id }, relations: {
            bestellungen: true,
            lieferant: true,
            kategorie: true,
            warenausgang: true,
            wareneingang: true,
            promocje: true,
            reservation: true,
            bewertung: true,
          }}).catch((err) => {
            console.log(err)
            throw err;
          });
        } catch (error) {
            throw new HttpException('Fehler beim Abrufen der Produkte', HttpStatus.NOT_FOUND);
        }
      }
    
      async createProdukt(productDto: ProductDto): Promise<Produkt> {
        try {
          console.log(productDto)
          const produkt = await this.produktRepository.create(productDto);
          console.log(produkt)
          return await this.produktRepository.save(produkt).catch((err) => {
            console.log(err)
            throw err;
          });
        } catch (error) {
         
            throw new HttpException('Fehler beim Erstellen des Produkts', HttpStatus.BAD_REQUEST);
        }
      }
    
      async updateProdukt(id: number, productDto: ProductDto): Promise<Produkt> {
        try {
          const produkt = await this.produktRepository.findOne({where: { id: id }});
          if (!produkt) {
            throw new HttpException('Produkt nicht gefunden', HttpStatus.NOT_FOUND);
          }
        await this.produktRepository.merge(produkt, productDto);
          return await this.produktRepository.save(produkt);
        } catch (error) {
            throw new HttpException('Produkt nicht gefunden', HttpStatus.NOT_FOUND);
        }
      }
    
      async deleteProdukt(id: number): Promise<DeleteResult> {
        try {
          return await this.produktRepository.delete(id).catch((err) => {
            console.log(err);
            throw new HttpException('Fehler beim Löschen des Produkts', HttpStatus.INTERNAL_SERVER_ERROR);
          });
        } catch (error) {
            throw new HttpException('Fehler beim Löschen des Produkts', HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }
}
