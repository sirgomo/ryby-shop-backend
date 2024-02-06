import { AcctionLogsDto } from 'src/dto/acction_logs.dto';
import { OrderDto } from 'src/dto/order.dto';
import { Payid } from 'src/dto/payId.dto';
import { PaypalItem } from 'src/dto/paypalItem.dto';
import { LogsService } from 'src/ebay_paypal_logs/logs.service';
import { LOGS_CLASS } from 'src/entity/logsEntity';
import { env } from 'src/env/env';
import { getPiceNettoPrice, getTax } from './helper_functions';

export function getPaypalItems(bestellungData: OrderDto): PaypalItem[] {
  const items: PaypalItem[] = [];
  for (let i = 0; i < bestellungData.produkte.length; i++) {
    const item = {} as PaypalItem;
    item.name = bestellungData.produkte[i].produkt[0].name;
    //  item.description = bestellungData.produkte[i].produkt[0].beschreibung;
    item.quantity = bestellungData.produkte[i].produkt[0].variations[0].quanity;
    item.sku = bestellungData.produkte[i].produkt[0].sku;
    item.unit_amount = {
      currency_code: 'EUR',
      value: getPiceNettoPrice(bestellungData, i),
    };
    item.tax = {
      currency_code: 'EUR',
      value: getTax(bestellungData, i),
    };
    items.push(item);
  }
  return items;
}
// generate access token
export async function generateAccessToken() {
  try {
    const auth = Buffer.from(env.CLIENT_ID + ':' + env.APP_SECRET).toString(
      'base64',
    );
    const response = await fetch(`${env.PAYPAL_URL}/v1/oauth2/token`, {
      method: 'post',
      body: 'grant_type=client_credentials',
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });
    const jsonData = await response.json();
    return jsonData.access_token;
  } catch (err) {
    console.log(err);
  }
}

export async function handleResponse(response: Response, logser: LogsService) {
  try {
    if (response.status === 200 || response.status === 201) {
      const jsonResponse = await response.json();

      return jsonResponse;
    }

    const errorMessage = await response.text();

    const logs: AcctionLogsDto = {
      error_class: LOGS_CLASS.PAYPAL_ERROR,
      error_message: errorMessage,
    };
    await logser.saveLog(logs);
    throw new Error(errorMessage);
  } catch (err) {
    throw err;
  }
}
//capture Payment
export async function capturePayment(data: Payid) {
  try {
    const accessToken = await generateAccessToken();
    const url = `${env.PAYPAL_URL}/v2/checkout/orders/${data.orderID}/capture`;
    const response = await fetch(url, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const respons = await handleResponse(response, this.logsService);
    if (respons.id === data.orderID && respons.status === 'COMPLETED') {
      data.bestellung.paypal_order_id = respons.id;
      await this.saveOrder(data.bestellung);
    }

    return respons;
  } catch (err) {
    console.log(err);
  }
}
// generate client token
export async function generateClientToken() {
  try {
    const accessToken = await generateAccessToken();
    const response = await fetch(
      `${env.PAYPAL_URL}/v1/identity/generate-token`,
      {
        method: 'post',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Accept-Language': 'en_US',
          'Content-Type': 'application/json',
        },
      },
    );

    const jsonData = await response.json();
    return jsonData.client_token;
  } catch (err) {
    console.log(err);
  }
}
