import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Color } from 'sharp';
import { ColorDto } from 'src/dto/color.dto';
import { OrderDto } from 'src/dto/order.dto';
import { Payid } from 'src/dto/payId.dto';
import { PaypalItem } from 'src/dto/paypalItem.dto';
import { BESTELLUNGSSTATE, BESTELLUNGSSTATUS, Bestellung } from 'src/entity/bestellungEntity';
import { Kunde } from 'src/entity/kundeEntity';
import { ProduktInBestellung } from 'src/entity/productBestellungEntity';
import { Produkt } from 'src/entity/produktEntity';
import { env } from 'src/env/env';
import { EntityManager, JsonContains, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt'

@Injectable()
export class BestellungenService {
    constructor(@InjectRepository(Bestellung) private readonly bestellungRepository: Repository<Bestellung>,
    @InjectRepository(ProduktInBestellung) private readonly productInRepository: Repository<ProduktInBestellung>,
    @InjectRepository(Produkt) private readonly productRepository: Repository<Produkt>) {}

    async createOrder(bestellungData: OrderDto): Promise<any> {
        try {
          //Check the quantity and price of the product, if it is correct, return the current list of products with quantity reduced by the order, 
          //quantity cannot be less than 0.
         await this.isPriceMengeChecked(bestellungData);
     
         bestellungData.gesamtwert = Number((this.getTotalPrice(bestellungData) + bestellungData.versandprice).toFixed(2));

         const purchaseAmount = bestellungData.gesamtwert;

      
         const accessToken  = await this.generateAccessToken();
         const url = `${env.PAYPAL_URL}/v2/checkout/orders`;
        
          const response = await fetch(url, {
            method: 'post',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              intent: 'CAPTURE',
              purchase_units: [
                {
                  items: this.getPaypalItems(bestellungData),
                  amount: {
                    currency_code: 'EUR',
                    value: purchaseAmount,
                    breakdown: {
                      item_total: {
                        currency_code: 'EUR',
                        value:  this.getTotalValue(bestellungData),
                      },
                      shipping: {
                        currency_code: 'EUR',
                        value: bestellungData.versandprice,
                      },
                      tax_total: {
                        currency_code: 'EUR',
                        value: this.getTotalTax(bestellungData),
                      }
                    }
                  },
                  shipping: {
                //    type:  bestellungData.versandart === 'Selbstabholung' ? 'PICKUP_IN_PERSON' : 'SHIPPING',
                    name: {
                      full_name: bestellungData.kunde.lieferadresse ? bestellungData.kunde.lieferadresse.shipping_name : bestellungData.kunde.vorname + ' ' + bestellungData.kunde.nachname,
                    },
                    address: {
                      address_line_1: bestellungData.kunde.lieferadresse ? bestellungData.kunde.lieferadresse.strasse : bestellungData.kunde.adresse.strasse,
                      address_line_2: bestellungData.kunde.lieferadresse ? bestellungData.kunde.lieferadresse.hausnummer: bestellungData.kunde.adresse.hausnummer,
                      admin_area_2: bestellungData.kunde.lieferadresse ? bestellungData.kunde.lieferadresse.stadt: bestellungData.kunde.adresse.stadt,
                      postal_code: bestellungData.kunde.lieferadresse ? bestellungData.kunde.lieferadresse.postleitzahl : bestellungData.kunde.adresse.postleitzahl,
                      country_code: 'DE',
                    }
                  }
                },
              ],
            }),
          })
        
       
          const bestellung = this.bestellungRepository.create(bestellungData);
  

          return this.handleResponse(response);
     
        } catch (error) {
          console.log(error)
          throw error;
        }
      }
  
  getTotalValue(bestellungData: OrderDto) {
    let total = 0;
    for (let i = 0; i < bestellungData.produkte.length; i++) {
      const color :ColorDto[] = JSON.parse(bestellungData.produkte[i].color);
      for (let y = 0; y < color.length; y++) {
        total += this.getPiceNettoPrice(bestellungData, i) * color[y].menge;
      }
    }
    return total.toFixed(2);
  }
    //Paid, now save the order and current list of products in the transaction
  async saveOrder(readyBesttelung: OrderDto) {
     try {
      readyBesttelung.bestellungstatus = BESTELLUNGSSTATUS.INBEARBEITUNG;
      readyBesttelung.bestelldatum = new Date(Date.now());
      readyBesttelung.gesamtwert = Number((this.getTotalPrice(readyBesttelung) + readyBesttelung.versandprice).toFixed(2));
      //Check the quantity and price of the product, if it is correct, return the current list of products with quantity reduced by the order, 
      //quantity cannot be less than 0.
      const itemsTosave = await this.isPriceMengeChecked(readyBesttelung);
  
      readyBesttelung.status = BESTELLUNGSSTATE.BEZAHLT;
      await this.bestellungRepository.manager.transaction(async (transactionalEntityMange) => {
      
        if(readyBesttelung.kunde.id) {
          const kunde = await transactionalEntityMange.findOne(Kunde, { where: {
            email: readyBesttelung.kunde.email,
          },
          relations: {
            adresse: true,
            lieferadresse: true,
          }
        })
        readyBesttelung.kunde = kunde;
      } else {
       
        readyBesttelung.kunde.role = 'USER';
        readyBesttelung.kunde.password = await bcrypt.hash('sd(/&23630askjdhhhsd', 10);
      

        const kunde = await transactionalEntityMange.create(Kunde, readyBesttelung.kunde);
        console.log(kunde)
        const newKunde = await transactionalEntityMange.save(Kunde, kunde);
        console.log(newKunde);
 

        readyBesttelung.kunde = newKunde;
      }
      readyBesttelung.zahlungsart = 'PAYPAL'
    
        await transactionalEntityMange.save(itemsTosave).catch((er) => {
          console.log(er);
          throw er;
        });
        const best = await transactionalEntityMange.create(Bestellung,  readyBesttelung);
        await transactionalEntityMange.save(Bestellung, best);
   
      });

     } catch (err) {
      console.log(err)
      throw err;
     }


    
  }

      async getOrderBeiId(id: number): Promise<Bestellung> {
        try {
          return await this.bestellungRepository.findOne({ 
            where: { id: id },
            relations: { 
              produkte: {
                produkt: true,
               } 
            }
          });
        } catch (error) {
          throw error;
        }
      }
      async getOrdersBeiKunde(kundeId: number): Promise<Bestellung[]> {
        try {
        return await this.bestellungRepository.find( { 
          where: { kunde: {
              id: kundeId,
              }
            },
        relations: {
          kunde: true,
          produkte: true,
        }
        })
        
        } catch (err) {
          throw err;
        }
      }
      async getOrders(): Promise<Bestellung[]> {
        try {
          console.log('find')
          return await this.bestellungRepository.find().catch((err) => {
            console.log(err);
            return err;
          });
        } catch (err) {
          throw err;
        }
      }
      
      async updateOrder(id: number, bestellungData: OrderDto): Promise<Bestellung> {
        try {
          const bestellung: Bestellung = await this.bestellungRepository.findOne({ 
            where: { id: id },
          });
          if (!bestellung) 
            throw new HttpException('Bestellung not found', HttpStatus.NOT_FOUND);
          
          if(bestellung.status == BESTELLUNGSSTATE.ABGEBROCHEN || bestellung.status == BESTELLUNGSSTATE.ARCHIVED)
            throw new HttpException('Bestellung kann nicht geändert werden!', HttpStatus.BAD_REQUEST);

          this.bestellungRepository.merge(bestellung, bestellungData);
          return await this.bestellungRepository.save(bestellung);
        } catch (error) {
          throw error;
        }
      }

      private getTotalTax(bestellungData: OrderDto): number {
        let tax = 0;
        for(let i = 0; i < bestellungData.produkte.length; i++) {
          const colors: ColorDto[] = JSON.parse(bestellungData.produkte[i].color);
          for (let y = 0; y < colors.length; y++) {
            tax += this.getTax(bestellungData, i) * colors[y].menge;
          }
        
        }
        return Number(tax.toFixed(2));
      }
      private getPaypalItems(bestellungData: OrderDto) : PaypalItem[] {
        const items: PaypalItem[] = [];
        for (let i = 0; i < bestellungData.produkte.length; i++) {
          const colors: ColorDto[] = JSON.parse(bestellungData.produkte[i].color);
          for (let y = 0; y < colors.length; y++) {
            const item = {} as PaypalItem;
            item.name = bestellungData.produkte[i].produkt[0].name;
            //  item.description = bestellungData.produkte[i].produkt[0].beschreibung;
            item.quantity = colors[y].menge;
            item.sku = bestellungData.produkte[i].produkt[0].product_sup_id;
            item.unit_amount = {
              currency_code: 'EUR',
              value: this.getPiceNettoPrice(bestellungData, i),
            };
            item.tax = {
              currency_code: 'EUR',
              value: this.getTax(bestellungData, i),
            };
            items.push(item);
          }
    
        }
        return items;
      }
      private async isPriceMengeChecked(data: OrderDto) {
        try {
          const items: Produkt[] = [];
     
          for (let i = 0; i < data.produkte.length; i++) {

           const index = items.findIndex((item) => item.id === data.produkte[i].produkt[0].id);
  
               let tmpItem: Produkt;
               let itemsInTmp: ColorDto[] = [];

              if(index === -1) {
                
                tmpItem = await this.productRepository.findOne({ 
                  where: { 
                    id: data.produkte[i].produkt[0].id 
                  },
                  relations: {
                          promocje: true,
                      } 
                  });
                  if(!tmpItem)
                   throw new HttpException('Produkct ' + data.produkte[i].produkt[0].id + ' wurde nicht gefunden!', HttpStatus.NOT_FOUND);

                data.produkte[i].produkt[0] = tmpItem;
                itemsInTmp = JSON.parse(tmpItem.color);
              } else {
                data.produkte[i].produkt[0] = items[index];
                itemsInTmp = JSON.parse(items[index].color);
                tmpItem = items[index];
              }
  
              const itemsInData: ColorDto[] = JSON.parse(data.produkte[i].color);
          
  
              for (let y = 0; y < itemsInData.length; y ++) {
                  for (let z = 0; z < itemsInTmp.length; z++ ) {
                      if( itemsInData[y].id == itemsInTmp[z].id) {
                          itemsInTmp[z].menge -= itemsInData[y].menge;
                          tmpItem.currentmenge -=  itemsInData[y].menge;
                          tmpItem.verkaufteAnzahl += itemsInData[y].menge;
                          if(itemsInTmp[z].menge == 0)
                            tmpItem.verfgbarkeit = 0;
                            
                          if(itemsInTmp[z].menge < 0)
                            throw new HttpException('3000/ ' + itemsInTmp[z].menge, HttpStatus.NOT_ACCEPTABLE);
                      }
                  }
              }
  
              tmpItem.color = JSON.stringify(itemsInTmp);
  
              items.push(tmpItem);
          }
         return items;
        } catch (err) {
          throw err;
        }

      }
  private getTotalPrice(bestellungData: OrderDto): number {
        let totalPrice = 0;
        for (let i = 0; i < bestellungData.produkte.length; i++) {
          const colors: ColorDto[] = JSON.parse(bestellungData.produkte[i].color);
          for (let y = 0; y < colors.length; y++) {
           const piceNetto = this.getPiceNettoPrice(bestellungData, i);
           const tax = this.getTax(bestellungData, i);

            totalPrice += (piceNetto + tax) * colors[y].menge; 
           
        }
      }
     
      return totalPrice;
    }
 private getTax(bestellungData: OrderDto, i: number): number {
    let picePrice = Number(bestellungData.produkte[i].produkt[0].preis);
    let tax = 0;
    if (bestellungData.produkte[i].produkt[0] && bestellungData.produkte[i].produkt[0].mehrwehrsteuer > 0)
      tax = picePrice * bestellungData.produkte[i].produkt[0].mehrwehrsteuer / 100;

    return Number(tax.toFixed(2));
  }

  private getPiceNettoPrice(bestellungData: OrderDto, i: number): number {
    let picePrice = Number(bestellungData.produkte[i].produkt[0].preis);
    if (bestellungData.produkte[i].produkt[0].promocje && bestellungData.produkte[i].produkt[0].promocje[0] && bestellungData.produkte[i].produkt[0].promocje[0].rabattProzent)
      picePrice -= picePrice * bestellungData.produkte[i].produkt[0].promocje[0].rabattProzent / 100;

      return picePrice;
  }
  // generate access token
  private async generateAccessToken() {
    const auth = Buffer.from(env.CLIENT_ID + ':' + env.APP_SECRET).toString('base64');
    const response = await fetch(`${env.PAYPAL_URL}/v1/oauth2/token`, {
      method: 'post',
      body: 'grant_type=client_credentials',
      headers: {
        Authorization: `Basic ${auth}`
      }
    });
    const jsonData = await response.json();
    return jsonData.access_token;
  }
  private async handleResponse(response: Response) {
    try {
      if(response.status === 200 || response.status === 201 ) {
        const jsonResponse = await response.json();
       
      return jsonResponse;
      }
       
      const errorMessage = await response.text();
      throw new Error(errorMessage);
    } catch ( err) {
      throw err;
    }
 

  }
  //capture Payment
  async capturePayment(data: Payid) {
  
    const accessToken = await this.generateAccessToken();
    const url = `${env.PAYPAL_URL}/v2/checkout/orders/${data.orderID}/capture`;
    const response = await fetch(url, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })
  
    const respons = await this.handleResponse(response);
    if(respons.id === data.orderID && respons.status === 'COMPLETED')
      await this.saveOrder(data.bestellung);

    return respons;
  }
  // generate client token
 async generateClientToken() {
  const accessToken = await this.generateAccessToken();
  const response = await fetch(`${env.PAYPAL_URL}/v1/identity/generate-token`, {
    method: 'post',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Accept-Language': 'en_US',
      'Content-Type': 'application/json',
    },
  })
  
  const jsonData = await response.json();
  return jsonData.client_token;
}
}


