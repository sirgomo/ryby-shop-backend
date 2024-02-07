export class EbayGroupItemDto {
  availability?: {
    pickupAtLocationAvailability?: PickupAtLocationAvailability[];
    shipToLocationAvailability?: ShipToLocationAvailability;
  };
  condition?: ConditionEnum;
  conditionDescription?: string;
  conditionDescriptors?: ConditionDescriptor[];
  groupIds?: string[];
  inventoryItemGroupKeys?: string[];
  locale?: LocaleEnum;
  packageWeightAndSize?: PackageWeightAndSize;
  product?: Product;
  sku?: string;
}
interface PickupAtLocationAvailability {
  availabilityType: 'IN_STOCK' | 'OUT_OF_STOCK' | 'SHIP_TO_STORE';
  fulfillmentTime: TimeDuration;
  merchantLocationKey: string;
  quantity: number;
}

interface ShipToLocationAvailability {
  allocationByFormat: {
    auction: number;
    fixedPrice: number;
  };
  availabilityDistributions: AvailabilityDistribution[];
  quantity: number;
}

interface AvailabilityDistribution {
  fulfillmentTime: TimeDuration;
  merchantLocationKey: string;
  quantity: number;
}

interface TimeDuration {
  unit:
    | 'YEAR'
    | 'MONTH'
    | 'DAY'
    | 'H'
    | 'CALENDAR_DAY'
    | 'BUSINESS_DAY'
    | 'MINUTE'
    | 'SECOND'
    | 'MILLISECOND';
  value: number;
}

enum ConditionEnum {
  NEW,
  LIKE_NEW,
  NEW_OTHER,
  NEW_WITH_DEFECTS,
  MANUFACTURER_REFURBISHED,
  CERTIFIED_REFURBISHED,
  EXCELLENT_REFURBISHED,
  VERY_GOOD_REFURBISHED,
  GOOD_REFURBISHED,
  SELLER_REFURBISHED,
  USED_EXCELLENT,
  USED_VERY_GOOD,
  USED_GOOD,
  USED_ACCEPTABLE,
  FOR_PARTS_OR_NOT_WORKING,
}

interface ConditionDescriptor {
  additionalInfo: string;
  name: string;
  values: string[];
}

enum LocaleEnum {
  en_US,
  en_CA,
  fr_CA,
  en_GB,
  en_AU,
  en_IN,
  de_AT,
  fr_BE,
  fr_FR,
  de_DE,
  it_IT,
  nl_BE,
  nl_NL,
  es_ES,
  de_CH,
  fi_FI,
  zh_HK,
  hu_HU,
  en_PH,
  pl_PL,
  pt_PT,
  ru_RU,
  en_SG,
  en_IE,
  en_MY,
}

interface PackageWeightAndSize {
  dimensions?: Dimensions;
  packageType?: PackageTypeEnum;
  weight?: Weight;
}

interface Dimensions {
  height?: number;
  length?: number;
  unit?: 'INCH' | 'FEET' | 'CENTIMETER' | 'METER';
  width?: number;
}

enum PackageTypeEnum {
  LETTER,
  BULKY_GOODS,
  CARAVAN,
  CARS,
  EUROPALLET,
  EXPANDABLE_TOUGH_BAGS,
  EXTRA_LARGE_PACK,
  FURNITURE,
  INDUSTRY_VEHICLES,
  LARGE_CANADA_POSTBOX,
  LARGE_CANADA_POST_BUBBLE_MAILER,
  LARGE_ENVELOPE,
  MAILING_BOX,
  MEDIUM_CANADA_POST_BOX,
  MEDIUM_CANADA_POST_BUBBLE_MAILER,
  MOTORBIKES,
  ONE_WAY_PALLET,
  PACKAGE_THICK_ENVELOPE,
  PADDED_BAGS,
  PARCEL_OR_PADDED_ENVELOPE,
  ROLL,
  SMALL_CANADA_POST_BOX,
  SMALL_CANADA_POST_BUBBLE_MAILER,
  TOUGH_BAGS,
  UPS_LETTER,
  USPS_FLAT_RATE_ENVELOPE,
  USPS_LARGE_PACK,
  VERY_LARGE_PACK,
  WINE_PAK,
}

interface Weight {
  unit?: 'POUND' | 'KILOGRAM' | 'OUNCE' | 'GRAM';
  value?: number;
}

interface Product {
  aspects?: string;
  brand?: string;
  description?: string;
  ean?: string[];
  epid?: string;
  imageUrls: string[];
  isbn?: string[];
  mpn?: string;
  subtitle?: string;
  title: string;
  upc?: string[];
  videoIds?: string[];
}
