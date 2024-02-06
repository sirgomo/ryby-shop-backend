import { countryPolicies } from './countryPolicies';

export class EbayOfferDto {
  /* EbayOfferDetailsWithAll */
  availableQuantity: number;
  categoryId: string;
  charity: {
    /* Charity */ charityId: string;
    donationPercentage: string;
  };
  extendedProducerResponsibility: {
    /* ExtendedProducerResponsibility */
    ecoParticipationFee: {
      /* Amount */ currency: string;
      value: string;
    };
    producerProductId: string;
    productDocumentationId: string;
    productPackageId: string;
    shipmentPackageId: string;
  };
  format: FormatTypeEnum;
  hideBuyerDetails: boolean;
  includeCatalogProductDetails: boolean;
  listing: {
    /* ListingDetails */ listingId: string;
    listingOnHold: boolean;
    listingStatus: ListingStatusEnum;
    soldQuantity: number;
  };
  listingDescription: string;
  listingDuration: ListingDurationEnum;
  listingPolicies: {
    /* ListingPolicies */
    bestOfferTerms: {
      /* BestOffer */
      autoAcceptPrice: {
        /* Amount */ currency: string;
        value: string;
      };
      autoDeclinePrice: {
        /* Amount */ currency: string;
        value: string;
      };
      bestOfferEnabled: boolean;
    };
    eBayPlusIfEligible: boolean;
    fulfillmentPolicyId: string;
    paymentPolicyId: string;
    productCompliancePolicyIds: string[];
    regionalProductCompliancePolicies: {
      /* RegionalProductCompliancePolicies */
      countryPolicies: countryPolicies[];
    };
    regionalTakeBackPolicies: {
      /* RegionalTakeBackPolicies */ countryPolicies: countryPolicies[];
    };
    returnPolicyId: string;
    shippingCostOverrides: [
      {
        /* ShippingCostOverride */
        additionalShippingCost: {
          /* Amount */ currency: string;
          value: string;
        };
        priority: number;
        shippingCost: {
          /* Amount */ currency: string;
          value: string;
        };
        shippingServiceType: ShippingServiceTypeEnum;
        surcharge: {
          /* Amount */ currency: string;
          value: string;
        };
      },
    ];
    takeBackPolicyId: string;
  };
  listingStartDate: string;
  lotSize: number;
  marketplaceId: MarketplaceEnum;
  merchantLocationKey: string;
  offerId: string;
  pricingSummary: {
    /* PricingSummary */
    auctionReservePrice: {
      /* Amount */ currency: string;
      value: string;
    };
    auctionStartPrice: {
      /* Amount */ currency: string;
      value: string;
    };
    minimumAdvertisedPrice: {
      /* Amount */ currency: string;
      value: string;
    };
    originallySoldForRetailPriceOn: SoldOnEnum;
    originalRetailPrice: {
      /* Amount */ currency: string;
      value: string;
    };
    price: {
      /* Amount */ currency: string;
      value: string;
    };
    pricingVisibility: MinimumAdvertisedPriceHandlingEnum;
  };
  quantityLimitPerBuyer: number;
  regulatory: {
    /* Regulatory */
    energyEfficiencyLabel: {
      /* EnergyEfficiencyLabel */ imageDescription: string;
      imageURL: string;
      productInformationSheet: string;
    };
    hazmat: {
      /* Hazmat */ component: string;
      pictograms: string[];
      signalWord: string;
      statements: string[];
    };
    repairScore: number;
  };
  secondaryCategoryId: string;
  sku: string;
  status: OfferStatusEnum;
  storeCategoryNames: string[];
  tax: {
    /* Tax */ applyTax: boolean;
    thirdPartyTaxCategory: string;
    vatPercentage: number;
  };
}

export enum FormatTypeEnum {
  AUCTION = 'AUCTION',
  FIXED_PRICE = 'FIXED_PRICE',
}
export enum ListingStatusEnum {
  ACTIVE = 'ACTIVE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  INACTIVE = 'INACTIVE',
  ENDED = 'ENDED',
  EBAY_ENDED = 'EBAY_ENDED',
  NOT_LISTED = 'NOT_LISTED',
}
export enum ListingDurationEnum {
  DAYS_1 = 'DAYS_1',
  DAYS_3 = 'DAYS_3',
  DAYS_5 = 'DAYS_5',
  DAYS_7 = 'DAYS_7',
  DAYS_10 = 'DAYS_10',
  DAYS_21 = 'DAYS_21',
  DAYS_30 = 'DAYS_30',
  GTC = 'GTC',
}
export enum ShippingServiceTypeEnum {
  DOMESTIC,
  INTERNATIONAL,
}
export enum MarketplaceEnum {
  EBAY_US,
  EBAY_MOTORS,
  EBAY_CA,
  EBAY_GB,
  EBAY_AU,
  EBAY_AT,
  EBAY_BE,
  EBAY_FR,
  EBAY_DE,
  EBAY_IT,
  EBAY_NL,
  EBAY_ES,
  EBAY_CH,
  EBAY_TW,
  EBAY_CZ,
  EBAY_DK,
  EBAY_FI,
  EBAY_GR,
  EBAY_HK,
  EBAY_HU,
  EBAY_IN,
  EBAY_ID,
  EBAY_IE,
  EBAY_IL,
  EBAY_MY,
  EBAY_NZ,
  EBAY_NO,
  EBAY_PH,
  EBAY_PL,
  EBAY_PT,
  EBAY_PR,
  EBAY_RU,
  EBAY_SG,
  EBAY_ZA,
  EBAY_SE,
  EBAY_TH,
  EBAY_VN,
  EBAY_CN,
  EBAY_PE,
  EBAY_JP,
}
export enum SoldOnEnum {
  ON_EBAY,
  OFF_EBAY,
  ON_AND_OFF_EBAY,
}
export enum MinimumAdvertisedPriceHandlingEnum {
  NONE,
  PRE_CHECKOUT,
  DURING_CHECKOUT,
}
export enum OfferStatusEnum {
  PUBLISHED,
  UNPUBLISHED,
}
