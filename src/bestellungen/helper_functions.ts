import { HttpException, HttpStatus } from '@nestjs/common';
import { AcctionLogsDto } from 'src/dto/acction_logs.dto';
import { OrderDto } from 'src/dto/order.dto';
import { LogsService } from 'src/ebay_paypal_logs/logs.service';
import { LOGS_CLASS } from 'src/entity/logsEntity';
import { Produkt } from 'src/entity/produktEntity';
import { Repository } from 'typeorm';

//get total netto value - promotion
export function getTotalNettoValue(bestellungData: OrderDto) {
  let total = 0;
  for (let i = 0; i < bestellungData.produkte.length; i++) {
    total +=
      getPiceNettoPrice(bestellungData, i) *
      bestellungData.produkte[i].produkt[0].variations[0].quanity;
  }
  return total.toFixed(2);
}
export function setProduktQuanity(readyBesttelung: OrderDto) {
  for (let i = 0; i < readyBesttelung.produkte.length; i++) {
    readyBesttelung.produkte[i].menge = 0;
    if (
      readyBesttelung.produkte[i].produkt[0].variations[0]
        .quanity_sold_at_once === 1
    ) {
      readyBesttelung.produkte[i].menge +=
        readyBesttelung.produkte[i].produkt[0].variations[0].quanity;
    } else {
      readyBesttelung.produkte[i].menge +=
        readyBesttelung.produkte[i].produkt[0].variations[0].quanity *
        readyBesttelung.produkte[i].produkt[0].variations[0]
          .quanity_sold_at_once;
    }
  }
}
export function getTotalTax(bestellungData: OrderDto): number {
  let tax = 0;
  for (let i = 0; i < bestellungData.produkte.length; i++) {
    tax +=
      getTax(bestellungData, i) *
      bestellungData.produkte[i].produkt[0].variations[0].quanity;
  }
  return Number(tax.toFixed(2));
}

//Check if there is sufficient quantity of items, set the prices, set item sku as color
export async function isPriceMengeChecked(
  data: OrderDto,
  logsService: LogsService,
  productRepository: Repository<Produkt>,
) {
  try {
    const items: Produkt[] = [];

    for (let i = 0; i < data.produkte.length; i++) {
      const index = items.findIndex(
        (item) => item.id === data.produkte[i].produkt[0].id,
      );

      let tmpItem: Produkt;

      if (index === -1) {
        tmpItem = await productRepository.findOne({
          where: {
            id: data.produkte[i].produkt[0].id,
          },
          relations: {
            promocje: true,
            variations: true,
          },
          select: {
            id: true,
            promocje: true,
            variations: true,
            sku: true,
          },
        });
        if (!tmpItem)
          throw new HttpException(
            'Produkct ' +
              data.produkte[i].produkt[0].id +
              ' wurde nicht gefunden!',
            HttpStatus.NOT_FOUND,
          );

        if (tmpItem.promocje && tmpItem.promocje[0])
          data.produkte[i].rabatt = tmpItem.promocje[0].rabattProzent;
      } else {
        tmpItem = items[index];
        if (items[index].promocje && items[index].promocje[0])
          data.produkte[i].rabatt = items[index].promocje[0].rabattProzent;
      }

      //check quanity
      for (let j = 0; j < tmpItem.variations.length; j++) {
        if (
          tmpItem.variations[j].sku ===
          data.produkte[i].produkt[0].variations[0].sku
        ) {
          tmpItem.variations[j].quanity -=
            data.produkte[i].produkt[0].variations[0].quanity *
            data.produkte[i].produkt[0].variations[0].quanity_sold_at_once;
          data.produkte[i].produkt[0].variations[0].price =
            tmpItem.variations[j].price;
          tmpItem.variations[j].quanity_sold +=
            data.produkte[i].produkt[0].variations[0].quanity *
            data.produkte[i].produkt[0].variations[0].quanity_sold_at_once;
          if (tmpItem.variations[j].quanity < 0)
            throw new HttpException(
              'Error quantity in variation by item ' +
                data.produkte[i].produkt[0].name +
                ' ist ' +
                tmpItem.variations[j].quanity,
              HttpStatus.NOT_ACCEPTABLE,
            );
        }
      }

      data.produkte[i].verkauf_price = getPiceNettoPrice(data, i);
      data.produkte[i].verkauf_rabat = getPromotionCost(data, i);
      data.produkte[i].verkauf_steuer = getTax(data, i);
      data.produkte[i].color = data.produkte[i].produkt[0].variations[0].sku;
      data.produkte[i].mengeGepackt = 0;

      items.push(tmpItem);
    }
    return items;
  } catch (err) {
    //save error on quanity check
    const logs: AcctionLogsDto = {
      error_class: LOGS_CLASS.SERVER_LOG,
      error_message: err,
    };
    await logsService.saveLog(logs);
    throw err;
  }
}
//get price - promotion % and + tax
export function getTotalPrice(bestellungData: OrderDto): number {
  let totalPrice = 0;
  for (let i = 0; i < bestellungData.produkte.length; i++) {
    const piceNetto = getPiceNettoPrice(bestellungData, i);
    const tax = getTax(bestellungData, i);

    totalPrice +=
      Number((piceNetto + tax).toFixed(2)) *
      bestellungData.produkte[i].produkt[0].variations[0].quanity;
  }

  return Number(totalPrice.toFixed(2));
}
//get tax for item
export function getTax(bestellungData: OrderDto, i: number): number {
  const picePrice = Number(
    bestellungData.produkte[i].produkt[0].variations[0].price,
  );
  let tax = 0;
  if (
    bestellungData.produkte[i].produkt[0] &&
    bestellungData.produkte[i].produkt[0].mehrwehrsteuer > 0
  )
    tax =
      (picePrice * bestellungData.produkte[i].produkt[0].mehrwehrsteuer) / 100;

  return Number(tax.toFixed(2));
}
//get netto price - promotion
export function getPiceNettoPrice(bestellungData: OrderDto, i: number): number {
  let picePrice = Number(
    bestellungData.produkte[i].produkt[0].variations[0].price,
  );
  if (
    bestellungData.produkte[i].produkt[0].promocje &&
    bestellungData.produkte[i].produkt[0].promocje[0] &&
    bestellungData.produkte[i].produkt[0].promocje[0].rabattProzent
  )
    picePrice -= Number(
      (
        (picePrice *
          bestellungData.produkte[i].produkt[0].promocje[0].rabattProzent) /
        100
      ).toFixed(2),
    );

  return Number(picePrice.toFixed(2));
}
//get promotion cost
export function getPromotionCost(bestellungData: OrderDto, i: number): number {
  let rabatCost = 0;
  if (
    bestellungData.produkte[i].produkt[0].promocje &&
    bestellungData.produkte[i].produkt[0].promocje[0] &&
    bestellungData.produkte[i].produkt[0].promocje[0].rabattProzent > 0
  )
    rabatCost =
      (bestellungData.produkte[i].produkt[0].variations[0].price *
        bestellungData.produkte[i].produkt[0].promocje[0].rabattProzent) /
      100;
  return Number(rabatCost.toFixed(2));
}
export async function setOwnProducs(
  data: OrderDto,
  logsService: LogsService,
  productRepository: Repository<Produkt>,
) {
  try {
    const items: Produkt[] = [];

    for (let i = 0; i < data.produkte.length; i++) {
      const index = items.findIndex(
        (item) => item.id === data.produkte[i].produkt[0].id,
      );

      let tmpItem: Produkt;

      if (index === -1) {
        tmpItem = await productRepository.findOne({
          where: {
            id: data.produkte[i].produkt[0].id,
          },
          relations: {
            variations: true,
          },
          select: {
            id: true,
            variations: true,
            sku: true,
          },
        });
        if (!tmpItem)
          throw new HttpException(
            'Produkct ' +
              data.produkte[i].produkt[0].id +
              ' wurde nicht gefunden!',
            HttpStatus.NOT_FOUND,
          );
      } else {
        tmpItem = items[index];
      }

      //check quanity
      for (let j = 0; j < tmpItem.variations.length; j++) {
        if (
          tmpItem.variations[j].sku ===
          data.produkte[i].produkt[0].variations[0].sku
        ) {
          tmpItem.variations[j].quanity -=
            data.produkte[i].produkt[0].variations[0].quanity *
            data.produkte[i].produkt[0].variations[0].quanity_sold_at_once;
          data.produkte[i].produkt[0].variations[0].price =
            tmpItem.variations[j].price;
          tmpItem.variations[j].quanity_sold +=
            data.produkte[i].produkt[0].variations[0].quanity *
            data.produkte[i].produkt[0].variations[0].quanity_sold_at_once;
          if (tmpItem.variations[j].quanity < 0)
            throw new HttpException(
              'Error quantity in variation by item ' +
                data.produkte[i].produkt[0].name +
                ' ist ' +
                tmpItem.variations[j].quanity,
              HttpStatus.NOT_ACCEPTABLE,
            );
        }
        data.produkte[i].mengeGepackt +=
          data.produkte[i].produkt[0].variations[0].quanity *
          data.produkte[i].produkt[0].variations[0].quanity_sold_at_once;
      }

      data.produkte[i].verkauf_steuer = getTax(data, i);
      data.produkte[i].color = data.produkte[i].produkt[0].variations[0].sku;

      items.push(tmpItem);
    }
    return items;
  } catch (err) {
    //save error on quanity check
    const logs: AcctionLogsDto = {
      error_class: LOGS_CLASS.SERVER_LOG,
      error_message: err,
    };
    await logsService.saveLog(logs);
    throw err;
  }
}
