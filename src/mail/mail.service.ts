import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { AcctionLogsDto } from 'src/dto/acction_logs.dto';
import { OrderDto } from 'src/dto/order.dto';
import { LogsService } from 'src/ebay_paypal_logs/logs.service';
import { LOGS_CLASS } from 'src/entity/logsEntity';
import { env } from 'src/env/env';

@Injectable()
export class MailService {
  constructor(
    private readonly mailer: MailerService,
    private readonly logsService: LogsService,
  ) {}

  async sendItemBughtEmail(order: OrderDto) {
    // Angenommen, bestelldatum ist ein String im Format "2024-02-18T07:30:28.355Z"
    try {
      await this.mailer.sendMail({
        to: [order.kunde.email],
        //from if you wanna override default sender
        subject: 'Vielen Dank für Ihren Auftrag nr:' + order.id,
        template: './itemBught',
        context: {
          name: order.kunde.nachname,
          produkte: order.produkte,
          adresse: JSON.parse(order.shipping_address_json),
          unternehmensname: env.email_company_name,
          orderid: order.id,
          bestelldatum: this.getFormatiertDateTime(
            order.bestelldatum.toISOString(),
          ),
          zahlungsart: order.zahlungsart,
          gesamtwert: order.gesamtwert.toFixed(2),
          versandprice: order.versandprice.toFixed(2),
          versandart: order.versandart,
          bestellungstatus: order.bestellungstatus,
          status: order.status,
        },
      });
      await this.sendToShop(order);
    } catch (err) {
      const log: AcctionLogsDto = {
        error_class: LOGS_CLASS.EMAIL,
        error_message:
          ' --------- NEW ORDER -----------\n' + JSON.stringify(err),
        user_email: order.kunde.email,
      };
      await this.logsService.saveLog(log);
      await this.sendToShop(order);
    }
  }
  private getFormatiertDateTime(date: string) {
    const bestelldatum = date;

    // Erstellen Sie ein neues Date-Objekt aus dem String
    const datumObj = new Date(bestelldatum);

    const formatiertesDatum = datumObj.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    // Entfernen Sie die Komponenten, die Sie nicht möchten (z.B. die Sekunden)
    const formatiertesDatumOhneSekunden = formatiertesDatum.replace(
      /:\d{2}$/,
      '',
    );
    return formatiertesDatumOhneSekunden;
  }

  async itemSendEmail(order: OrderDto) {
    try {
      await this.mailer.sendMail({
        to: order.kunde.email,
        from: env.email_from,
        subject: 'Bestellung mit nr ' + order.id + ' wurde verschickt',
        template: './itemSend',
        context: {
          orderNumber: order.id,
          name: order.kunde.nachname,
          unternehmensname: env.email_company_name,
          shippingDate: this.getFormatiertDateTime(
            new Date(Date.now()).toISOString(),
          ),
          adresse: JSON.parse(order.shipping_address_json),
          womit: order.versandart,
          versandnr: order.varsandnr ? 'Nr. ' + order.varsandnr : '',
        },
      });
    } catch (err) {
      const log: AcctionLogsDto = {
        error_class: LOGS_CLASS.EMAIL,
        error_message:
          ' ---------ITEM SEND TO THE CUSTOMER-----------\n' +
          JSON.stringify(err),
        user_email: order.kunde.email,
      };
      await this.logsService.saveLog(log);
    }
  }
  async sendToShop(order: OrderDto) {
    try {
      await this.mailer.sendMail({
        to: [env.email_from],
        //from if you wanna override default sender
        subject: 'Vielen Dank für Ihren Auftrag nr:' + order.id,
        template: './itemBught',
        context: {
          name: order.kunde.nachname,
          produkte: order.produkte,
          adresse: JSON.parse(order.shipping_address_json),
          unternehmensname: 'Fischfang-Profi',
          orderid: order.id,
          bestelldatum: this.getFormatiertDateTime(
            order.bestelldatum.toISOString(),
          ),
          zahlungsart: order.zahlungsart,
          gesamtwert: order.gesamtwert.toFixed(2),
          versandprice: order.versandprice.toFixed(2),
          versandart: order.versandart,
          bestellungstatus: order.bestellungstatus,
          status: order.status,
        },
      });
    } catch (err) {
      const log: AcctionLogsDto = {
        error_class: LOGS_CLASS.EMAIL,
        error_message:
          ' --------- EMAIL SEND TO SHOP -----------\n' + JSON.stringify(err),
        user_email: order.kunde.email,
      };
      await this.logsService.saveLog(log);
    }
  }
}
