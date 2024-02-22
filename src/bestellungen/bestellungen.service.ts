import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderDto } from 'src/dto/order.dto';
import {
  BESTELLUNGSSTATE,
  BESTELLUNGSSTATUS,
  Bestellung,
} from 'src/entity/bestellungEntity';
import { Kunde } from 'src/entity/kundeEntity';
import { ProduktInBestellung } from 'src/entity/productBestellungEntity';
import { Produkt } from 'src/entity/produktEntity';
import { env } from 'src/env/env';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { GetOrderSettingsDto } from 'src/dto/getOrderSettings.dto';
import { LogsService } from 'src/ebay_paypal_logs/logs.service';
import { AcctionLogsDto } from 'src/dto/acction_logs.dto';
import { LOGS_CLASS } from 'src/entity/logsEntity';
import { EbayOffersService } from 'src/ebay/ebay-offers/ebay-offers.service';
import {
  generateAccessToken,
  getPaypalItems,
  handleResponse,
} from './paypal_function';
import { isEbayMengeChecked } from './ebay_functions';
import {
  getTotalNettoValue,
  getTotalPrice,
  getTotalTax,
  isPriceMengeChecked,
  setProduktQuanity,
} from './helper_functions';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class BestellungenService {
  constructor(
    @InjectRepository(Bestellung)
    private readonly bestellungRepository: Repository<Bestellung>,
    @InjectRepository(ProduktInBestellung)
    private readonly productInRepository: Repository<ProduktInBestellung>,
    @InjectRepository(Produkt)
    private readonly productRepository: Repository<Produkt>,
    private readonly logsService: LogsService,
    private readonly ebayOfferService: EbayOffersService,
    private readonly mailService: MailService,
  ) {}

  async createOrder(bestellungData: OrderDto): Promise<any> {
    try {
      //Check the quantity and price of the product, if it is correct, return the current list of products with quantity reduced by the order,
      //quantity cannot be less than 0.
      await isPriceMengeChecked(
        bestellungData,
        this.logsService,
        this.productRepository,
      );
      await isEbayMengeChecked(
        bestellungData,
        this.ebayOfferService,
        this.logsService,
      );
      bestellungData.gesamtwert = Number(
        (getTotalPrice(bestellungData) + bestellungData.versandprice).toFixed(
          2,
        ),
      );
      const purchaseAmount = bestellungData.gesamtwert;

      const accessToken = await generateAccessToken();
      const url = `${env.PAYPAL_URL}/v2/checkout/orders`;

      if (bestellungData.kunde.vorname === 'TEST') return;

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
              items: getPaypalItems(bestellungData),
              amount: {
                currency_code: 'EUR',
                value: purchaseAmount,
                breakdown: {
                  item_total: {
                    currency_code: 'EUR',
                    value: getTotalNettoValue(bestellungData),
                  },
                  shipping: {
                    currency_code: 'EUR',
                    value: bestellungData.versandprice,
                  },
                  tax_total: {
                    currency_code: 'EUR',
                    value: getTotalTax(bestellungData),
                  },
                },
              },
              shipping: {
                //    type:  bestellungData.versandart === 'Selbstabholung' ? 'PICKUP_IN_PERSON' : 'SHIPPING',
                name: {
                  full_name: bestellungData.kunde.lieferadresse
                    ? bestellungData.kunde.lieferadresse.shipping_name
                    : bestellungData.kunde.vorname +
                      ' ' +
                      bestellungData.kunde.nachname,
                },
                address: {
                  address_line_1: bestellungData.kunde.lieferadresse
                    ? bestellungData.kunde.lieferadresse.strasse
                    : bestellungData.kunde.adresse.strasse,
                  address_line_2: bestellungData.kunde.lieferadresse
                    ? bestellungData.kunde.lieferadresse.hausnummer
                    : bestellungData.kunde.adresse.hausnummer,
                  admin_area_2: bestellungData.kunde.lieferadresse
                    ? bestellungData.kunde.lieferadresse.stadt
                    : bestellungData.kunde.adresse.stadt,
                  postal_code: bestellungData.kunde.lieferadresse
                    ? bestellungData.kunde.lieferadresse.postleitzahl
                    : bestellungData.kunde.adresse.postleitzahl,
                  country_code: 'DE',
                },
              },
            },
          ],
        }),
      });

      return handleResponse(response, this.logsService);
    } catch (error) {
      //save error on create order!
      const logs: AcctionLogsDto = {
        error_class: LOGS_CLASS.SERVER_LOG,
        error_message:
          ' ------------ CREATE ORDER ------------\n' +
          JSON.stringify([bestellungData, error]),
        created_at: new Date(Date.now()),
      };
      await this.logsService.saveLog(logs);
      console.log(error);
      throw error;
    }
  }

  //Paid, now save the order and current list of products in the transaction
  async saveOrder(readyBesttelung: OrderDto) {
    try {
      readyBesttelung.bestellungstatus = BESTELLUNGSSTATUS.INBEARBEITUNG;
      readyBesttelung.bestelldatum = new Date(Date.now());
      readyBesttelung.gesamtwert = Number(
        (getTotalPrice(readyBesttelung) + readyBesttelung.versandprice).toFixed(
          2,
        ),
      );
      //Check the quantity and price of the product, if it is correct, return the current list of products with quantity reduced by the order,
      //quantity cannot be less than 0.
      const itemsTosave = await isPriceMengeChecked(
        readyBesttelung,
        this.logsService,
        this.productRepository,
      );
      //set produkt quantity for item where there is more items are selled at once ( only in online-shop, in ebay they are default sold as 1 stuck)
      setProduktQuanity(readyBesttelung);

      readyBesttelung.status = BESTELLUNGSSTATE.BEZAHLT;
      await this.bestellungRepository.manager.transaction(
        async (transactionalEntityMange) => {
          // ... existing code
          if (readyBesttelung.kunde.id) {
            const kunde = await transactionalEntityMange.findOne(Kunde, {
              where: {
                email: readyBesttelung.kunde.email,
              },
              relations: {
                adresse: true,
                lieferadresse: true,
              },
            });
            readyBesttelung.kunde = kunde;
          } else {
            readyBesttelung.kunde.role = 'USER';
            readyBesttelung.kunde.password = await bcrypt.hash(
              'sd(/&23630askjdhhhsd',
              10,
            );

            const kunde = await transactionalEntityMange.create(
              Kunde,
              readyBesttelung.kunde,
            );
            const newKunde = await transactionalEntityMange.save(Kunde, kunde);
            readyBesttelung.kunde = newKunde;
          }
          readyBesttelung.zahlungsart = 'PAYPAL';
          readyBesttelung.shipping_address_json = readyBesttelung.kunde
            .lieferadresse
            ? JSON.stringify(readyBesttelung.kunde.lieferadresse)
            : JSON.stringify({
                ...readyBesttelung.kunde.adresse,
                shipping_name: readyBesttelung.kunde.vorname
                  ? readyBesttelung.kunde.vorname +
                    ' ' +
                    readyBesttelung.kunde.nachname
                  : readyBesttelung.kunde.nachname,
              });
          await transactionalEntityMange.save(Produkt, itemsTosave);
          const best = await transactionalEntityMange.create(
            Bestellung,
            readyBesttelung,
          );
          readyBesttelung.id = (
            await transactionalEntityMange.save(Bestellung, best)
          ).id;
        },
      );
      //save transaction for checkout
      readyBesttelung.kunde.password = undefined;
      const logs: AcctionLogsDto = {
        error_class: LOGS_CLASS.SUCCESS_LOG,
        error_message:
          ' --------- TRANSACTION SUCCESSFULL ------- \n' +
          JSON.stringify([readyBesttelung, ' new item quantity ', itemsTosave]),
        paypal_transaction_id: readyBesttelung.paypal_order_id,
        user_email: readyBesttelung.kunde.email,
        created_at: new Date(Date.now()),
      };
      await isEbayMengeChecked(
        readyBesttelung,
        this.ebayOfferService,
        this.logsService,
        true,
      );

      await this.mailService.sendItemBughtEmail(readyBesttelung);
      await this.logsService.saveLog(logs);
    } catch (err) {
      //save log on error on save transaction
      readyBesttelung.kunde.password = undefined;
      const logs: AcctionLogsDto = {
        error_class: LOGS_CLASS.PAYPAL_ERROR,
        error_message:
          ' -------- ERROR ON SAVE ORDER TO DATABASE ------------ \n' +
          JSON.stringify([readyBesttelung, err]),
        paypal_transaction_id: readyBesttelung.paypal_order_id,
        user_email: readyBesttelung.kunde.email,
        created_at: new Date(Date.now()),
      };
      await this.logsService.saveLog(logs);
      console.log(err);
      throw err;
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
            },
          },
          kunde: {
            adresse: true,
            lieferadresse: true,
          },
          refunds: true,
        },
        select: {
          kunde: {
            id: true,
            nachname: true,
            vorname: true,
            email: true,
            telefon: true,
            treuepunkte: true,
          },
          produkte: {
            id: true,
            menge: true,
            color: true,
            color_gepackt: true,
            rabatt: true,
            mengeGepackt: true,
            verkauf_price: true,
            verkauf_rabat: true,
            verkauf_steuer: true,
            produkt: {
              id: true,
              name: true,
              sku: true,
              variations: true,
            },
          },
        },
      });
      if (!item)
        throw new HttpException('Bestellung not found', HttpStatus.NOT_FOUND);
      return item;
    } catch (error) {
      throw new HttpException('Bestellung not found', HttpStatus.NOT_FOUND);
    }
  }
  async getOrdersBeiKunde(kundeId: number): Promise<[Bestellung[], number]> {
    try {
      return await this.bestellungRepository.findAndCount({
        where: {
          kunde: {
            id: kundeId,
          },
        },
        relations: {
          kunde: true,
          produkte: {
            produkt: {
              variations: true,
            },
          },
          refunds: true,
        },
        select: {
          kunde: {
            id: true,
            nachname: true,
            vorname: true,
            email: true,
            telefon: true,
            treuepunkte: true,
          },
          produkte: {
            id: true,
            menge: true,
            color: true,
            color_gepackt: true,
            rabatt: true,
            mengeGepackt: true,
            verkauf_price: true,
            verkauf_rabat: true,
            verkauf_steuer: true,
            produkt: {
              id: true,
              name: true,
              sku: true,
              variations: true,
            },
          },
        },
      });
    } catch (err) {
      throw err;
    }
  }
  async getOrders(
    getSettings: GetOrderSettingsDto,
    sitenr: number,
  ): Promise<Bestellung[]> {
    try {
      const skip = sitenr * getSettings.itemsProSite - getSettings.itemsProSite;
      return await this.bestellungRepository
        .findAndCount({
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
          },
        })
        .catch((err) => {
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
        },
      });

      if (!bestellung)
        throw new HttpException('Bestellung not found', HttpStatus.NOT_FOUND);

      if (
        bestellungData.status === BESTELLUNGSSTATE.ABGEBROCHEN &&
        bestellung.bestellungstatus === BESTELLUNGSSTATUS.VERSCHICKT
      )
        throw new HttpException(
          'Bestellung kann nicht abgebrochen werden wenn es bereits verschickt wurde',
          HttpStatus.BAD_REQUEST,
        );

      if (
        (bestellungData.status === BESTELLUNGSSTATE.COMPLETE ||
          bestellungData.status === BESTELLUNGSSTATE.ARCHIVED) &&
        bestellung.bestellungstatus === BESTELLUNGSSTATUS.INBEARBEITUNG
      )
        throw new HttpException(
          'Bestellung ist nocht nicht verschickt',
          HttpStatus.BAD_REQUEST,
        );

      if (
        bestellung.status == BESTELLUNGSSTATE.ABGEBROCHEN ||
        bestellung.status == BESTELLUNGSSTATE.ARCHIVED
      )
        throw new HttpException(
          'Bestellung kann nicht geändert werden!',
          HttpStatus.BAD_REQUEST,
        );

      for (let i = 0; i < bestellungData.produkte.length; i++) {
        if (
          bestellungData.produkte[i].menge <
          bestellungData.produkte[i].mengeGepackt
        )
          throw new HttpException(
            'Menge gepackt kann nicht größer werder als bestellungs Menge',
            HttpStatus.BAD_REQUEST,
          );
      }
      if (bestellung.bestellungstatus === BESTELLUNGSSTATUS.VERSCHICKT) {
        for (let i = 0; i < bestellungData.produkte.length; i++) {
          if (
            bestellungData.produkte[i].menge !== bestellung.produkte[i].menge ||
            bestellungData.produkte[i].mengeGepackt !==
              bestellung.produkte[i].mengeGepackt
          )
            throw new HttpException(
              'Bestellung verschickt, die Menge kann nicht geändert werden',
              HttpStatus.NOT_ACCEPTABLE,
            );
        }
      }
      await this.bestellungRepository.merge(bestellung, bestellungData);
      const save = await this.bestellungRepository.save(bestellung);
      const logs: AcctionLogsDto = {
        error_class: LOGS_CLASS.SUCCESS_LOG,
        error_message:
          ' ------ ORDER UPDATED --------\n' +
          JSON.stringify([bestellungData, save]) +
          '\n',
        user_email: bestellungData.kunde.email + '\n',
        paypal_transaction_id: bestellungData.paypal_order_id,
      };
      if (
        bestellung.versand_datum !== null &&
        bestellung.bestellungstatus === BESTELLUNGSSTATUS.VERSCHICKT &&
        bestellungData.bestellungstatus == BESTELLUNGSSTATUS.VERSCHICKT
      )
        await this.mailService.itemSendEmail(bestellungData);
      await this.logsService.saveLog(logs);
      return save;
    } catch (error) {
      //save error on update
      const logs: AcctionLogsDto = {
        error_class: LOGS_CLASS.SERVER_LOG,
        error_message:
          ' ------ ERROR ON UPDATE ORDER --------\n' +
          JSON.stringify([bestellungData, error]),
        user_email: bestellungData.kunde.email,
        paypal_transaction_id: bestellungData.paypal_order_id,
      };
      await this.logsService.saveLog(logs);
      throw error;
    }
  }
}
