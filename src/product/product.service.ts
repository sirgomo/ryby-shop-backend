import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteFileDto } from 'src/dto/deleteFilde.dto';
import { ProductDto } from 'src/dto/product.dto';
import { Produkt } from 'src/entity/produktEntity';
import { DeleteResult, Like, NumericType, Repository } from 'typeorm';

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
      async getAllProdukteForKunden(search: string, katid: number, pagecount: number, pagenr: number): Promise<Produkt[]> {
      
        if(!isFinite(pagenr) || pagenr < 1)
        pagenr = 1;
        const start = pagecount * pagenr - pagecount;
        const end = pagecount * pagenr;
        try {
          if(search != 'null' && katid != 0) {
                  return await this.produktRepository.find({ where: {
                    name: Like(`%${search}%`),
                    kategorie: {
                      id: katid,
                    },
                    verfgbarkeit: 1,
                  },
                relations: {
                  kategorie: true,
                  promocje: true,
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
                  verfgbarkeit: 1,
                },
                relations: {
                  promocje: true,
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
            },
            verfgbarkeit: 1,
          },
        relations: {
          kategorie: true,
          promocje: true,
        },
        take: end, 
        skip: start,
      }).catch(err => {
        console.log(err)
        return err;
      })
        }
           

          return await this.produktRepository.find( { where: { verfgbarkeit: 1 }});
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
            bewertung: true,
            eans: true,
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
          const produkt = await this.produktRepository.create(productDto);
    
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
          if(productDto.eans && productDto.eans.length > 0) {
            for (let i = 0; i < productDto.eans.length; i++) {
           
                    produkt.eans[i].product = { id: produkt.id } as Produkt;
            }
          }
        
         
          return await this.produktRepository.save(produkt).catch((err) => {
            console.log(err)
            return err;
          });
        } catch (error) {
          console.log(error)
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
      async deleteImage(image: DeleteFileDto) {
        try {
          const item = await this.produktRepository.findOne({where: { id: image.produktid }});

          if(!item)
            return false;

            const images: string[] = JSON.parse(item.foto);
           const index = images.findIndex((tmp) => tmp === image.fileid)
            images.splice(index, 1);
            item.foto = JSON.stringify(images);
          await this.produktRepository.save(item);
          
          return true;
        } catch (err) {
          return err;
        }
      }
      async addImage(image: string, productid: number) {
        try {
          const item = await this.produktRepository.findOne({where: { id : productid }});
          if(!item)
            return false;

          const currentImages: string[] = JSON.parse(item.foto);
          currentImages.push(image);
          item.foto = JSON.stringify(currentImages);
          await this.produktRepository.save(item);

          return true;
        } catch (err) {
          return err;
        }
      }
      async getProduktsForBuchung(lieferantId: number) {
        try {
          if(lieferantId === 0) {
            return await this.produktRepository.find();
          }
          return await this.produktRepository.find({
            where: {
              lieferant: {
                id: lieferantId,
              }
            },
            relations: {
              lieferant: true,
          }})
        } catch (err ) {
          return new HttpException(err.message, HttpStatus.BAD_REQUEST);
        }
      }
}
