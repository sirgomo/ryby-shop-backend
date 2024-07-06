export interface FinazTransactionDto {
    href: string;
    limit: number;
    next: string;
    offset: number;
    prev: string;
    total: number;
    transactions: Transaction[];
  }
  
  export interface Transaction {
    amount: Amount;
    bookingEntry: BookingEntryEnum;
    buyer: Buyer;
    eBayCollectedTaxAmount: Amount;
    feeJurisdiction: FeeJurisdiction;
    feeType: FeeTypeEnum;
    orderId: string;
    orderLineItems: OrderLineItem[];
    paymentsEntity: string;
    payoutDetails: PayoutDetails;
    payoutId: string;
    references: Reference[];
    salesRecordReference: string;
    taxes: Tax[];
    totalFeeAmount: Amount;
    totalFeeBasisAmount: Amount;
    transactionDate: string;
    transactionId: string;
    transactionMemo: string;
    transactionStatus: TransactionStatusEnum;
    transactionType: TransactionTypeEnum;
  }
  
  export interface Amount {
    convertedFromCurrency: CurrencyCodeEnum;
    convertedFromValue: string;
    convertedToCurrency: CurrencyCodeEnum;
    convertedToValue: string;
    currency: CurrencyCodeEnum;
    exchangeRate: string;
    value: string;
  }
  
  export enum CurrencyCodeEnum {
    AED, AFN, ALL, AMD, ANG, AOA, ARS, AUD, AWG, AZN, BAM, BBD, BDT, BGN, BHD, BIF, BMD, BND, BOB, BRL, BSD, BTN, BWP, BYR, BZD, CAD, CDF, CHF, CLP, CNY, COP, CRC, CUP, CVE, CZK, DJF, DKK, DOP, DZD, EGP, ERN, ETB, EUR, FJD, FKP, GBP, GEL, GHS, GIP, GMD, GNF, GTQ, GYD, HKD, HNL, HRK, HTG, HUF, IDR, ILS, INR, IQD, IRR, ISK, JMD, JOD, JPY, KES, KGS, KHR, KMF, KPW, KRW, KWD, KYD, KZT, LAK, LBP, LKR, LRD, LSL, LTL, LYD, MAD, MDL, MGA, MKD, MMK, MNT, MOP, MRO, MUR, MVR, MWK, MXN, MYR, MZN, NAD, NGN, NIO, NOK, NPR, NZD, OMR, PAB, PEN, PGK, PHP, PKR, PLN, PYG, QAR, RON, RSD, RUB, RWF, SAR, SBD, SCR, SDG, SEK, SGD, SHP, SLL, SOS, SRD, STD, SYP, SZL, THB, TJS, TMT, TND, TOP, TRY, TTD, TWD, TZS, UAH, UGX, USD, UYU, UZS, VEF, VND, VUV, WST, XAF, XCD, XOF, XPF, YER, ZAR, ZMW, ZWL
  }
  
  export enum BookingEntryEnum {
    CREDIT, DEBIT
  }
  
  export interface Buyer {
    username: string;
  }
  
  export interface FeeJurisdiction {
    regionName: string;
    regionType: RegionTypeEnum;
  }
  
  export enum RegionTypeEnum {
    COUNTRY, STATE_OR_PROVINCE
  }
  
  export enum FeeTypeEnum {
    BELOW_STANDARD_FEE = 'BELOW_STANDARD_FEE',
    BELOW_STANDARD_SHIPPING_FEE = 'BELOW_STANDARD_SHIPPING_FEE',
    FINAL_VALUE_FEE_FIXED_PER_ORDER = 'FINAL_VALUE_FEE_FIXED_PER_ORDER',
    FINAL_FEE = 'FINAL_FEE',
    INTERNATIONAL_FEE = 'INTERNATIONAL_FEE',
    HIGH_ITEM_NOT_AS_DESCRIBED_FEE = 'HIGH_ITEM_NOT_AS_DESCRIBED_FEE',
    HIGH_ITEM_NOT_AS_DESCRIBED_SHIPPING_FEE = 'HIGH_ITEM_NOT_AS_DESCRIBED_SHIPPING_FEE',
    PAYMENT_PROCESSING_FEE = 'PAYMENT_PROCESSING_FEE',
    FINAL_VALUE_SHIPPINGEE = 'FINAL_VALUE_SHIPPINGEE',
    INSERTION_FEE = 'INSERTION_FEE',
    BOLD_FEE = 'BOLD_FEE',
    FINANCE_FEE = 'FINANCE_FEE',
    CATEGORY_FEATURED_FEE = 'CATEGORY_FEATURED_FEE',
    NSFCHECK_FEE = 'NSFCHECK_FEE',
    PROMOTIONAL_CREDIT = 'PROMOTIONAL_CREDIT',
    GALLERY_FEE = 'GALLERY_FEE',
    FEATURED_GALLERY_FEE = 'FEATURED_GALLERY_FEE',
    RESERVE_PRICE_FEE = 'RESERVE_PRICE_FEE',
    IPIXPHOTO_FEE = 'IPIXPHOTO_FEE',
    LARGE_PICTURE_FEE = 'LARGE_PICTURE_FEE',
    EBAY_STORE_SUBSCRIPTION_FEE = 'EBAY_STORE_SUBSCRIPTION_FEE',
    BUY_IT_NOW_FEE = 'BUY_IT_NOW_FEE',
    SUBTITLE_FEE = 'SUBTITLE_FEE',
    INTERNATIONAL_LISTING_FEE = 'INTERNATIONAL_LISTING_FEE',
    PRO_PACK_BUNDLE_FEE = 'PRO_PACK_BUNDLE_FEE',
    MARKETPLACE_RESEARCH_PRO_SUBSCRIPTION_FEE = 'MARKETPLACE_RESEARCH_PRO_SUBSCRIPTION_FEE',
    VEHICLE_LOCAL_SUBSCRIPTION_FEE = 'VEHICLE_LOCAL_SUBSCRIPTION_FEE',
    VEHICLE_LOCAL_INSERTION_FEE = 'VEHICLE_LOCAL_INSERTION_FEE',
    VALUE_PACK_BUNDLE_FEE = 'VALUE_PACK_BUNDLE_FEE',
    PRO_PACK_PLUS_BUNDLE_FEE = 'PRO_PACK_PLUS_BUNDLE_FEE',
    GALLERY_PLUS_FEE = 'GALLERY_PLUS_FEE',
    EBAY_MOTORS_PRO_FEE = 'EBAY_MOTORS_PRO_FEE',
    PRIVATE_LISTING_FEE = 'PRIVATE_LISTING_FEE',
    AUCTION_END_EARLY_FEE = 'AUCTION_END_EARLY_FEE',
    STORE_SUBSCRIPTION_EARLY_TERMINATION_FEE = 'STORE_SUBSCRIPTION_EARLY_TERMINATION_FEE',
    AD_FEE = 'AD_FEE',
    EBAY_PLUS_SUBSCRIPTION_FEE = 'EBAY_PLUS_SUBSCRIPTION_FEE',
    VEHICLE_SUBSCRIPTION_FEE = 'VEHICLE_SUBSCRIPTION_FEE',
    CO_FUNDING_COUPON_FEE = 'CO_FUNDING_COUPON_FEE',
    PAYMENT_DISPUTE_FEE = 'PAYMENT_DISPUTE_FEE',
    PREMIUM_AD_FEES = 'PREMIUM_AD_FEES',
    VEHICLES_BASIC_PACKAGE_FEE = 'VEHICLES_BASIC_PACKAGE_FEE',
    VEHICLES_PLUS_PACKAGE_FEE = 'VEHICLES_PLUS_PACKAGE_FEE',
    VEHICLES_PREMIUM_PACKAGE_FEE = 'VEHICLES_PREMIUM_PACKAGE_FEE',
    DEPOSIT_PROCESSING_FEE = 'DEPOSIT_PROCESSING_FEE',
    EXPRESS_PAYOUT_FEE = 'EXPRESS_PAYOUT_FEE',
    TAX_DEDUCTION_AT_SOURCE = 'TAX_DEDUCTION_AT_SOURCE',
    INCOME_TAX_WITHHOLDING = 'INCOME_TAX_WITHHOLDING',
    VAT_WITHHOLDING = 'VAT_WITHHOLDING',
    BANK_PAYOUT_FEE = 'BANK_PAYOUT_FEE',
    CHARITY_DONATION = 'CHARITY_DONATION',
    REGULATORY_OPERATING_FEE = 'REGULATORY_OPERATING_FEE',
    OTHER_FEES = 'OTHER_FEES'
}
  
  export interface OrderLineItem {
    donations: Donation[];
    feeBasisAmount: Amount;
    lineItemId: string;
    marketplaceFees: MarketplaceFee[];
  }
  
  export interface Donation {
    amount: Amount;
    feeJurisdiction: FeeJurisdiction;
    feeMemo: string;
    feeType: FeeTypeEnum;
  }
  
  export interface MarketplaceFee {
    amount: Amount;
    feeJurisdiction: FeeJurisdiction;
    feeMemo: string;
    feeType: FeeTypeEnum;
  }
  
  export interface PayoutDetails {
    payoutIds: string[];
    payoutReference: string;
  }
  
  export interface Reference {
    referenceId: string;
    referenceType: ReferenceTypeEnum;
  }
  
  export enum ReferenceTypeEnum {
    CANCELLATION_ID, CASE_ID, INVOICE, ITEM_ID, ORDER_ID, PAYMENTS_DISPUTE_ID, REFUND_ID, LOAN_REPAYMENT_ID, RETURN_ID, PAYOUT_ID
  }
  
  export interface Tax {
    taxType: TaxTypeEnum;
    amount: Amount}
  
  export enum TaxTypeEnum {
    VAT
  }
  
  export enum TransactionStatusEnum {
    FUNDS_ON_HOLD, FUNDS_PROCESSING, FUNDS_AVAILABLE_FOR_PAYOUT, PAYOUT, COMPLETED, FAILED
  }
  export enum TransactionTypeEnum {
    SALE = 'SALE',
    REFUND = 'REFUND',
    CREDIT = 'CREDIT',
    DISPUTE = 'DISPUTE',
    SHIPPING_LABEL = 'SHIPPING_LABEL',
    TRANSFER = 'TRANSFER',
    NON_SALE_CHARGE = 'NON_SALE_CHARGE',
    ADJUSTMENT = 'ADJUSTMENT',
    WITHDRAWAL = 'WITHDRAWAL',
    LOAN_REPAYMENT = 'LOAN_REPAYMENT',
    PURCHASE = 'PURCHASE'
  }