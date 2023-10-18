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
  

          return this.handleResponse(response);
     
        } catch (error) {
          console.log(error)
          throw error;
        }
      }
  //get total netto value - promotion
  getTotalNettoValue(bestellungData: OrderDto) {
    let total = 0;
 
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

  private setProduktQuanity(readyBesttelung: OrderDto) {
    
  }

      async getOrderBeiId(id: number): Promise<Bestellung> {
        try {
          return await this.bestellungRepository.findOne({ 
            where: { id: id },
            relations: { 
              produkte: {
                produkt: true,
               },
               kunde: {
                adresse: true,
                lieferadresse: true,
               }, 
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
      async getOrders(getSettings: GetOrderSettingsDto, sitenr: number): Promise<Bestellung[]> {
       
        try {
          const skip = sitenr * getSettings.itemsProSite - getSettings.itemsProSite;
          return await this.bestellungRepository.findAndCount({
            where: {
              status: getSettings.state,
              bestellungstatus: getSettings.status,
            },
            take: getSettings.itemsProSite,
            skip: skip
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
          });
          if (!bestellung) 
            throw new HttpException('Bestellung not found', HttpStatus.NOT_FOUND);


          if(bestellungData.status === BESTELLUNGSSTATE.ABGEBROCHEN && bestellung.bestellungstatus === BESTELLUNGSSTATUS.VERSCHICKT)
           throw new HttpException('Bestellung kann nicht abgebrochen werden wenn es bereits verschickt wurde', HttpStatus.BAD_REQUEST);

          if( (bestellungData.status === BESTELLUNGSSTATE.COMPLETE || bestellungData.status === BESTELLUNGSSTATE.ARCHIVED) && bestellung.bestellungstatus === BESTELLUNGSSTATUS.INBEARBEITUNG)
           throw new HttpException('Bestellung ist nocht nicht verschickt', HttpStatus.BAD_REQUEST);
          
          if(bestellung.status == BESTELLUNGSSTATE.ABGEBROCHEN || bestellung.status == BESTELLUNGSSTATE.ARCHIVED)
            throw new HttpException('Bestellung kann nicht geändert werden!', HttpStatus.BAD_REQUEST);

          this.bestellungRepository.merge(bestellung, bestellungData);
          console.log(bestellung)
          return await this.bestellungRepository.save(bestellung);
        } catch (error) {
          throw error;
        }
      }

      private getTotalTax(bestellungData: OrderDto): number {
        let tax = 0;
        for(let i = 0; i < bestellungData.produkte.length; i++) {
         
        
        }
        return Number(tax.toFixed(2));
      }
      private getPaypalItems(bestellungData: OrderDto) : PaypalItem[] {
        const items: PaypalItem[] = [];
        for (let i = 0; i < bestellungData.produkte.length; i++) {

    
        }
        return items;
      }
      //Check if there is sufficient quantity of items, set the prices
      private async isPriceMengeChecked(data: OrderDto) {
        try {
          const items: Produkt[] = [];
     
       //TODO
         return items;
        } catch (err) {
          throw err;
        }

      }
      //get price - promotion % and + tax
  private getTotalPrice(bestellungData: OrderDto): number {
        let totalPrice = 0;
        for (let i = 0; i < bestellungData.produkte.length; i++) {
        
 
      }
     
      return totalPrice;
    }
    //get tax for item
 private getTax(bestellungData: OrderDto, i: number): number {
    const tax = 0;

    return Number(tax.toFixed(2));
  }
//get netto price - promotion
  private getPiceNettoPrice(bestellungData: OrderDto, i: number): number {


      return 0;
  }
  //get promotion cost
  private getPromotionCost(bestellungData: OrderDto, i: number): number {
    let rabatCost = 0;

    return Number(rabatCost.toFixed(2));
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


