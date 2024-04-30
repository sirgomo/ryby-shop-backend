import { HttpException, HttpStatus } from '@nestjs/common';
import { AcctionLogsDto } from 'src/dto/acction_logs.dto';
import { EbayGroupItemDto } from 'src/dto/ebay/ebayGroupItem.dto';
import { OrderDto } from 'src/dto/order.dto';
import { EbayOffersService } from 'src/ebay/ebay-offers/ebay-offers.service';
import { LogsService } from 'src/ebay_paypal_logs/logs.service';
import { LOGS_CLASS } from 'src/entity/logsEntity';

//check quantity item on ebay
export async function isEbayMengeChecked(
  bestellungData: OrderDto,
  ebayOfferService: EbayOffersService,
  logsService: LogsService,
  itemSold?: boolean,
) {
  const itemsQuanity: { sku: string; quantity: number }[] = [];

  for (let i = 0; i < bestellungData.produkte.length; i++) {
    const index = itemsQuanity.findIndex(
      (item) =>
        item.sku === bestellungData.produkte[i].produkt[0].variations[0].sku,
    );
    if (index !== -1) {
      itemsQuanity[index].quantity +=
        bestellungData.produkte[i].produkt[0].variations[0].quanity /
        bestellungData.produkte[i].produkt[0].variations[0]
          .quanity_sold_at_once;
    } else {
      const item: { sku: string; quantity: number } = {
        sku: bestellungData.produkte[i].produkt[0].variations[0].sku,
        quantity:
          bestellungData.produkte[i].produkt[0].variations[0].quanity /
          bestellungData.produkte[i].produkt[0].variations[0]
            .quanity_sold_at_once,
      };
      itemsQuanity.push(item);
    }
  }
  if (!itemSold)
    for (let i = 0; i < itemsQuanity.length; i++) {
      await getEbayResponse(
        itemsQuanity[i].sku,
        itemsQuanity[i].quantity,
        3,
        bestellungData,
        ebayOfferService,
        logsService,
      );
    }
  if (itemSold) {
    for (let i = 0; i < itemsQuanity.length; i++) {
      await updateEbayOffer(
        itemsQuanity[i].sku,
        itemsQuanity[i].quantity,
        3,
        bestellungData,
        ebayOfferService,
        logsService,
      );
    }
  }
}
//get ebay response, try 3 times
async function getEbayResponse(
  sku: string,
  quantity: number,
  requestquantity: number,
  bestellungData: OrderDto,
  ebayOfferService: EbayOffersService,
  logsService: LogsService,
) {
  try {
    //save error when there is repose from ebay
    if (requestquantity === 0) {
      const logs: AcctionLogsDto = {
        error_class: LOGS_CLASS.EBAY_ERROR,
        error_message: JSON.stringify([
          bestellungData,
          'getEbayResponse has no response..., please try once more ',
        ]),
        created_at: new Date(Date.now()),
      };
      await logsService.saveLog(logs);
      throw new HttpException(
        'getEbayResponse has no response..., please try once more ',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const respo = await ebayOfferService.getInventoryItemBySku(sku);
    if (respo.availability.shipToLocationAvailability) {
      const itemQuantity =
        respo.availability.shipToLocationAvailability.quantity;

      if (!itemQuantity)
        await getEbayResponse(
          sku,
          quantity,
          requestquantity - 1,
          bestellungData,
          ebayOfferService,
          logsService,
        );
      if (itemQuantity - quantity < 0) {
        const logs: AcctionLogsDto = {
          error_class: LOGS_CLASS.EBAY_ERROR,
          error_message: JSON.stringify([
            bestellungData,
            `sku : ${sku} quantity : ${quantity} ebay quantity: ${itemQuantity}`,
            'Insufficient quantity of the item in stock!',
          ]),
          created_at: new Date(Date.now()),
        };
        await logsService.saveLog(logs);
        throw new HttpException(
          'Insufficient quantity of the item in stock!',
          HttpStatus.FAILED_DEPENDENCY,
        );
      }
    }
  } catch (err) {
    console.log(err);
  }
}
async function updateEbayOffer(
  sku: string,
  quantity: number,
  requestquantity: number,
  bestellungData: OrderDto,
  ebayOfferService: EbayOffersService,
  logsService: LogsService,
) {
  if (requestquantity === 0) {
    const logs: AcctionLogsDto = {
      error_class: LOGS_CLASS.EBAY_ERROR,
      error_message: JSON.stringify([
        bestellungData,
        'updateEbayOffer has no response..., please try once more ',
      ]),
      created_at: new Date(Date.now()),
    };
    await logsService.saveLog(logs);
    throw new HttpException(
      'updateEbayOffer has no response..., please try once more ',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
  try {
    const group: EbayGroupItemDto =
      await ebayOfferService.getInventoryItemBySku(sku);

    if (!group || !group.availability)
      await updateEbayOffer(
        sku,
        quantity,
        requestquantity - 1,
        bestellungData,
        ebayOfferService,
        logsService,
      );

    if (
      group.availability.shipToLocationAvailability.quantity - quantity >=
      0
    ) {
      group.availability.shipToLocationAvailability.quantity -= quantity;
    } else {
      group.availability.shipToLocationAvailability.quantity = 0;
    }
    if (group.packageWeightAndSize.weight.value === 0)
      group.packageWeightAndSize = undefined;
    await updateEbayGroupItem(
      group,
      quantity,
      3,
      ebayOfferService,
      logsService,
    );
  } catch (err) {}
}
async function updateEbayGroupItem(
  group: EbayGroupItemDto,
  quantity: number,
  retry: number,
  offerService: EbayOffersService,
  logsService: LogsService,
) {
  if (retry === 0) {
    const logs: AcctionLogsDto = {
      error_class: LOGS_CLASS.EBAY_ERROR,
      error_message: JSON.stringify([group, 'item quantity - ' + quantity]),
      created_at: new Date(Date.now()),
    };
    await logsService.saveLog(logs);
    throw new HttpException(
      'ebay group item updated not possible',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
  try {
    const requ = await offerService.updateEbayInventoryItem(
      group.sku,
      JSON.stringify(group),
    );
    if (requ[1] === 204) {
      const logs: AcctionLogsDto = {
        error_class: LOGS_CLASS.SUCCESS_LOG,
        error_message: JSON.stringify([group, 'item quantity - ' + quantity]),
        created_at: new Date(Date.now()),
      };
      await logsService.saveLog(logs);
    } else {
      await updateEbayGroupItem(
        [group, await requ[0].text()] as EbayGroupItemDto,
        quantity,
        retry - 1,
        offerService,
        logsService,
      );
    }
  } catch (err) {}
}
