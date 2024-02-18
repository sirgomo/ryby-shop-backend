import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { OrderDto } from 'src/dto/order.dto';
import { AdresseKunde } from 'src/entity/addressEntity';
import { env } from 'src/env/env';

@Injectable()
export class MailService {
  constructor(private readonly mailer: MailerService) {}

  async sendItemBughtEmail(order: OrderDto) {
    if (!order.kunde.lieferadresse) {
      order.kunde.adresse = {
        ...order.kunde.adresse,
        shipping_name: order.kunde.vorname
          ? order.kunde.vorname + ' ' + order.kunde.nachname
          : '' + ' ' + order.kunde.nachname,
      } as AdresseKunde;
    }
    // Angenommen, bestelldatum ist ein String im Format "2024-02-18T07:30:28.355Z"
    const bestelldatum = order.bestelldatum;

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
    try {
      await this.mailer.sendMail({
        to: [order.kunde.email],
        //from if you wanna override default sender
        subject: 'Vielen Dank für Ihren Auftrag nr:' + order.id,
        template: './itemBught',
        context: {
          name: order.kunde.nachname,
          produkte: order.produkte,
          adresse: order.kunde.lieferadresse
            ? order.kunde.lieferadresse
            : order.kunde.adresse,
          unternehmensname: 'Fischfang-Profi',
          orderid: order.id,
          bestelldatum: formatiertesDatumOhneSekunden,
          zahlungsart: order.zahlungsart,
          gesamtwert: order.gesamtwert.toFixed(2),
          versandprice: order.versandprice.toFixed(2),
          versandart: order.versandart,
          bestellungstatus: order.bestellungstatus,
          status: order.status,
        },
      });
      await this.mailer.sendMail({
        to: [env.email_from],
        //from if you wanna override default sender
        subject: 'Vielen Dank für Ihren Auftrag nr:' + order.id,
        template: './itemBught',
        context: {
          name: order.kunde.nachname,
          produkte: order.produkte,
          adresse: order.kunde.lieferadresse
            ? order.kunde.lieferadresse
            : order.kunde.adresse,
          unternehmensname: 'Fischfang-Profi',
          orderid: order.id,
          bestelldatum: formatiertesDatumOhneSekunden,
          zahlungsart: order.zahlungsart,
          gesamtwert: order.gesamtwert.toFixed(2),
          versandprice: order.versandprice.toFixed(2),
          versandart: order.versandart,
          bestellungstatus: order.bestellungstatus,
          status: order.status,
        },
      });
    } catch (err) {
      console.log(err);
    }
  }
}
