import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ColorDto } from 'src/dto/color.dto';
import { OrderDto } from 'src/dto/order.dto';
import { BESTELLUNGSSTATUS, Bestellung } from 'src/entity/bestellungEntity';
import { ProduktInBestellung } from 'src/entity/productBestellungEntity';
import { Produkt } from 'src/entity/produktEntity';
import { env } from 'src/env/env';
import { Repository } from 'typeorm';

@Injectable()
export class BestellungenService {
    constructor(@InjectRepository(Bestellung) private readonly bestellungRepository: Repository<Bestellung>,
    @InjectRepository(ProduktInBestellung) private readonly productInRepository: Repository<ProduktInBestellung>,
    @InjectRepository(Produkt) private readonly productRepository: Repository<Produkt>) {}

    async createOrder(bestellungData: OrderDto): Promise<any> {
        try {
          console.log(JSON.stringify(bestellungData))
         const itemsToSave: Promise<Produkt[]> = this.isPriceMengeChecked(bestellungData);
         bestellungData.bestellungstatus = BESTELLUNGSSTATUS.INBEARBEITUNG;
         bestellungData.bestelldatum = new Date(Date.now());
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
                  amount: {
                    currency_code: 'EUR',
                    value: purchaseAmount,
                  },
                },
              ],
            }),
          })
        
       
          const bestellung = this.bestellungRepository.create(bestellungData);
  

          return this.handleResponse(response);
         // return await this.bestellungRepository.save(bestellung);
        } catch (error) {
          console.log(error)
          throw new HttpException('Error creating bestellung', HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }
    
      async getBestellung(id: number): Promise<Bestellung> {
        try {
          return await this.bestellungRepository.findOne({ where: { id: id }});
        } catch (error) {
          throw new HttpException('Error retrieving bestellung', HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }
    
      async updateBestellung(id: number, bestellungData: OrderDto): Promise<Bestellung> {
        try {
          const bestellung = await this.bestellungRepository.findOne({ where: { id: id }});
          if (!bestellung) {
            throw new HttpException('Bestellung not found', HttpStatus.NOT_FOUND);
          }
          this.bestellungRepository.merge(bestellung, bestellungData);
          return await this.bestellungRepository.save(bestellung);
        } catch (error) {
          throw new HttpException('Error updating bestellung', HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }
    
      async deleteBestellung(id: number): Promise<void> {
        try {
          const bestellung = await this.bestellungRepository.findOne({ where: { id: id }});
          if (!bestellung) {
            throw new HttpException('Bestellung not found', HttpStatus.NOT_FOUND);
          }
          await this.bestellungRepository.remove(bestellung);
        } catch (error) {
          throw new HttpException('Error deleting bestellung', HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }
      private async isPriceMengeChecked(data: OrderDto) {
        const items: Produkt[] = [];
       try {
        for (let i = 0; i < data.produkte.length; i++) {
            const tmpItem = await this.productRepository.findOne({ 
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

            const itemsInData: ColorDto[] = JSON.parse(data.produkte[i].color);
            const itemsInTmp: ColorDto[] = JSON.parse(tmpItem.color);

            for (let y = 0; y < itemsInData.length; y ++) {
                for (let z = 0; z < itemsInTmp.length; z++ ) {
                    if( itemsInData[y].id == itemsInTmp[z].id) {
                        itemsInTmp[z].menge -= itemsInData[y].menge;
                        if(itemsInTmp[z].menge < 0)
                          throw new HttpException('3000/' + itemsInTmp[z].menge, HttpStatus.NOT_ACCEPTABLE);
                    }
                }
            }

            tmpItem.color = JSON.stringify(itemsInTmp);

            items.push(tmpItem);
        }
       } catch (error) {
        throw error;
       }
       return items;
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

    return tax;
  }

  private getPiceNettoPrice(bestellungData: OrderDto, i: number): number {
    console.log(bestellungData.produkte[i])
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
    if(response.status === 200 || response.status === 201 ) {
      const jsonResponse = await response.json();
      console.log(jsonResponse);
    return jsonResponse;
    }
     

    const errorMessage = await response.text();
    throw new Error(errorMessage);
  }
  //capture Payment
  async capturePayment(orderId) {
  
    const accessToken = await this.generateAccessToken();
    const url = `${env.PAYPAL_URL}/v2/checkout/orders/${orderId}/capture`;
    const response = await fetch(url, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })
  
    return this.handleResponse(response);
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
  console.log('response', response.status);
  const jsonData = await response.json();
  return jsonData.client_token;
}
}


