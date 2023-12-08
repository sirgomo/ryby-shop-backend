import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderDto } from 'src/dto/order.dto';
import { Payid } from 'src/dto/payId.dto';
import { PaypalItem } from 'src/dto/paypalItem.dto';
import { BESTELLUNGSSTATE, BESTELLUNGSSTATUS, Bestellung } from 'src/entity/bestellungEntity';
import { Kunde } from 'src/entity/kundeEntity';
import { ProduktInBestellung } from 'src/entity/productBestellungEntity';
import { Produkt } from 'src/entity/produktEntity';
import { env } from 'src/env/env';
import {  Repository } from 'typeorm';
import * as bcrypt from 'bcrypt'
import { GetOrderSettingsDto } from 'src/dto/getOrderSettings.dto';

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

      
         const accessToken  = await generateAccessToken();
         const url = `${env.PAYPAL_URL}/v2/checkout/orders`;
        
        if(bestellungData.kunde.vorname === 'TEST') 
        return;

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
                        value:  this.getTotalNettoValue(bestellungData),
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
  

          return handleResponse(response);
     
        } catch (error) {
          console.log(error)
          throw error;
        }
      }
  //get total netto value - promotion
  getTotalNettoValue(bestellungData: OrderDto) {
    let total = 0;
    for (let i = 0; i < bestellungData.produkte.length; i++) {
        total += this.getPiceNettoPrice(bestellungData, i) * bestellungData.produkte[i].produkt[0].variations[0].quanity;  
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

      this.setProduktQuanity(readyBesttelung);

      readyBesttelung.status = BESTELLUNGSSTATE.BEZAHLT;
      await this.bestellungRepository.manager.transaction(async (transactionalEntityMange) => {
       
        // ... existing code
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
        const newKunde = await transactionalEntityMange.save(Kunde, kunde);
        readyBesttelung.kunde = newKunde;
      }
      readyBesttelung.zahlungsart = 'PAYPAL'
    
        await transactionalEntityMange.save(Produkt, itemsTosave);
        const best = await transactionalEntityMange.create(Bestellung,  readyBesttelung);
        await transactionalEntityMange.save(Bestellung, best);
   
      });

     } catch (err) {
      console.log(err)
      throw err;
     }


    
  }

  private setProduktQuanity(readyBesttelung: OrderDto) {
    for (let i = 0; i < readyBesttelung.produkte.length; i++) {
      readyBesttelung.produkte[i].menge = 0;
        readyBesttelung.produkte[i].menge += readyBesttelung.produkte[i].produkt[0].variations[0].quanity;
    }
  }

      async getOrderBeiId(id: number): Promise<Bestellung> {
        try {
          const item = await this.bestellungRepository.findOne({ 
            where: { id: id },
            relations: { 
              produkte: {
                produkt: {
                  variations: true,
                }
               },
               kunde: {
                adresse: true,
                lieferadresse: true,
               },
               refunds: true, 
            }
          });
          if(!item)
           throw new HttpException('Bestellung not found', HttpStatus.NOT_FOUND);

          return item;
        } catch (error) {
          throw new HttpException('Bestellung not found', HttpStatus.NOT_FOUND);
        }
      }
      async getOrdersBeiKunde(kundeId: number): Promise<[Bestellung[], number]> {
       
        try {
        return await this.bestellungRepository.findAndCount( { 
          where: { kunde: {
              id: kundeId,
              }
            },
        relations: {
          kunde: true,
          produkte: {
            produkt: {
              variations: true,
            }
          },
          refunds: true,
        }
        })
        
        } catch (err) {
          throw err;
        }
      }
      async getOrders(getSettings: GetOrderSettingsDto, sitenr: number): Promise<Bestellung[]> {
       
        try {
          const skip = sitenr * getSettings.itemsProSite - getSettings.itemsProSite;
          return await this.bestellungRepository.findAndCount({
            where: {
              status: getSettings.state,
              bestellungstatus: getSettings.status,
            },
            take: getSettings.itemsProSite,
            skip: skip,
            order: {
              bestelldatum: 'DESC',
            },
            relations: {
              refunds: true,
            }
          }).catch((err) => {
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
            relations: {
              produkte: true,
            }
          });
          if (!bestellung) 
            throw new HttpException('Bestellung not found', HttpStatus.NOT_FOUND);


          if(bestellungData.status === BESTELLUNGSSTATE.ABGEBROCHEN && bestellung.bestellungstatus === BESTELLUNGSSTATUS.VERSCHICKT)
           throw new HttpException('Bestellung kann nicht abgebrochen werden wenn es bereits verschickt wurde', HttpStatus.BAD_REQUEST);

          if( (bestellungData.status === BESTELLUNGSSTATE.COMPLETE || bestellungData.status === BESTELLUNGSSTATE.ARCHIVED) && bestellung.bestellungstatus === BESTELLUNGSSTATUS.INBEARBEITUNG)
           throw new HttpException('Bestellung ist nocht nicht verschickt', HttpStatus.BAD_REQUEST);
          
          if(bestellung.status == BESTELLUNGSSTATE.ABGEBROCHEN || bestellung.status == BESTELLUNGSSTATE.ARCHIVED)
            throw new HttpException('Bestellung kann nicht geändert werden!', HttpStatus.BAD_REQUEST);

        
            for (let i = 0; i < bestellungData.produkte.length; i++) {
              if(bestellungData.produkte[i].menge < bestellungData.produkte[i].mengeGepackt)
               throw new HttpException('Menge gepackt kann nicht größer werder als bestellungs Menge', HttpStatus.BAD_REQUEST);
            }
          if(bestellungData.bestellungstatus === BESTELLUNGSSTATUS.VERSCHICKT && bestellung.bestellungstatus === BESTELLUNGSSTATUS.VERSCHICKT)
          {
            for (let i = 0; i < bestellungData.produkte.length; i++) {
              if(bestellungData.produkte[i].menge !== bestellung.produkte[i].menge || bestellungData.produkte[i].mengeGepackt !== bestellung.produkte[i].mengeGepackt)
               throw new HttpException('Bestellung verschickt, die Menge kann nicht geändert werden', HttpStatus.BAD_REQUEST);
            }
          }

          this.bestellungRepository.merge(bestellung, bestellungData);
          return await this.bestellungRepository.save(bestellung);
        } catch (error) {
          throw error;
        }
      }

      private getTotalTax(bestellungData: OrderDto): number {
        let tax = 0;
        for(let i = 0; i < bestellungData.produkte.length; i++) {
            tax += this.getTax(bestellungData, i) * bestellungData.produkte[i].produkt[0].variations[0].quanity;
        }
        return Number(tax.toFixed(2));
      }
      private getPaypalItems(bestellungData: OrderDto) : PaypalItem[] {
        const items: PaypalItem[] = [];
        for (let i = 0; i < bestellungData.produkte.length; i++) {
    
            const item = {} as PaypalItem;
            item.name = bestellungData.produkte[i].produkt[0].name;
            //  item.description = bestellungData.produkte[i].produkt[0].beschreibung;
            item.quantity = bestellungData.produkte[i].produkt[0].variations[0].quanity;
            item.sku = bestellungData.produkte[i].produkt[0].sku;
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
        return items;
      }
      //Check if there is sufficient quantity of items, set the prices, set item sku as color
      private async isPriceMengeChecked(data: OrderDto) {
        try {
          const items: Produkt[] = [];
     
          for (let i = 0; i < data.produkte.length; i++) {

           const index = items.findIndex((item) => item.id === data.produkte[i].produkt[0].id);
  
               let tmpItem: Produkt;
              

              if(index === -1) {
                
                tmpItem = await this.productRepository.findOne({ 
                  where: { 
                    id: data.produkte[i].produkt[0].id 
                  },
                  relations: {
                          promocje: true,
                          variations: true,
                      } 
                  });
                  if(!tmpItem)
                   throw new HttpException('Produkct ' + data.produkte[i].produkt[0].id + ' wurde nicht gefunden!', HttpStatus.NOT_FOUND);

             
                if(tmpItem.promocje && tmpItem.promocje[0])
                  data.produkte[i].rabatt = tmpItem.promocje[0].rabattProzent;

              } else {
             
  
                tmpItem = items[index];
                if(items[index].promocje && items[index].promocje[0])
                data.produkte[i].rabatt = items[index].promocje[0].rabattProzent;
            
              }
        
              //check quanity
              for (let j = 0; j < tmpItem.variations.length; j++) {
                 if(tmpItem.variations[j].sku === data.produkte[i].produkt[0].variations[0].sku) {
                    tmpItem.variations[j].quanity -= data.produkte[i].produkt[0].variations[0].quanity;
                    data.produkte[i].produkt[0].variations[0].price = tmpItem.variations[j].price;
                    tmpItem.variations[j].quanity_sold += data.produkte[i].produkt[0].variations[0].quanity;
                             
                    if(tmpItem.variations[j].quanity < 0)
                    throw new HttpException('Error 3000/ quanity by item ' + data.produkte[i].produkt[0].name+ ' ist ' + tmpItem.variations[j].quanity, HttpStatus.NOT_ACCEPTABLE);
                 }
              }

              data.produkte[i].verkauf_price = this.getPiceNettoPrice(data, i);
              data.produkte[i].verkauf_rabat = this.getPromotionCost(data, i);
              data.produkte[i].verkauf_steuer = this.getTax(data, i);
              data.produkte[i].color = data.produkte[i].produkt[0].variations[0].sku;
              data.produkte[i].mengeGepackt = 0;

  
              items.push(tmpItem);
          }
         return items;
        } catch (err) {
          throw err;
        }

      }
      //get price - promotion % and + tax
  private getTotalPrice(bestellungData: OrderDto): number {
    let totalPrice = 0;
    for (let i = 0; i < bestellungData.produkte.length; i++) {
       const piceNetto = this.getPiceNettoPrice(bestellungData, i);
       const tax = this.getTax(bestellungData, i);

        totalPrice += (piceNetto + tax) * bestellungData.produkte[i].produkt[0].variations[0].quanity; 
  }
 
  return totalPrice;
    }
    //get tax for item
 private getTax(bestellungData: OrderDto, i: number): number {
  let picePrice = Number(bestellungData.produkte[i].produkt[0].variations[0].price);
  let tax = 0;
  if (bestellungData.produkte[i].produkt[0] && bestellungData.produkte[i].produkt[0].mehrwehrsteuer > 0)
    tax = picePrice * bestellungData.produkte[i].produkt[0].mehrwehrsteuer / 100;

  return Number(tax.toFixed(2));
  }
//get netto price - promotion
  private getPiceNettoPrice(bestellungData: OrderDto, i: number): number {
    let picePrice = Number(bestellungData.produkte[i].produkt[0].variations[0].price);
    if (bestellungData.produkte[i].produkt[0].promocje && bestellungData.produkte[i].produkt[0].promocje[0] && bestellungData.produkte[i].produkt[0].promocje[0].rabattProzent)
      picePrice -= picePrice * bestellungData.produkte[i].produkt[0].promocje[0].rabattProzent / 100;

      return picePrice;
  }
  //get promotion cost
  private getPromotionCost(bestellungData: OrderDto, i: number): number {
    let rabatCost = 0;
    if (bestellungData.produkte[i].produkt[0].promocje && bestellungData.produkte[i].produkt[0].promocje[0] && bestellungData.produkte[i].produkt[0].promocje[0].rabattProzent > 0)
    rabatCost = bestellungData.produkte[i].produkt[0].variations[i].price * bestellungData.produkte[i].produkt[0].promocje[0].rabattProzent / 100;
    return Number(rabatCost.toFixed(2));
  }

  //capture Payment
  async capturePayment(data: Payid) {
  
    const accessToken = await generateAccessToken();
    const url = `${env.PAYPAL_URL}/v2/checkout/orders/${data.orderID}/capture`;
    const response = await fetch(url, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })
  
    const respons = await handleResponse(response);
    if(respons.id === data.orderID && respons.status === 'COMPLETED') {
      data.bestellung.paypal_order_id = respons.id;
      await this.saveOrder(data.bestellung);
    }
    

    return respons;
  }
  // generate client token
 async generateClientToken() {
  const accessToken = await generateAccessToken();
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

  // generate access token
  export async function generateAccessToken() {
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

  export async function handleResponse(response: Response) {
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