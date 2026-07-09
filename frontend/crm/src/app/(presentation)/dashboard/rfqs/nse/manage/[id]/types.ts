export interface RfqInformationDataProps {
  isin: string;
  segment?: string;
  buySell?: string;
  quoteType?: string;
  dealType?: string;
  rfqSizeCrores?: string;
  settlementDate?: string;
  yieldType?: string;
  yield?: string;
  rfqNumber?: string;
  participantCode?: string;
  clientRegistrationType?: string;
  status?: string;
}

export interface TradingOptionsDataProps {
  rfqValidTillMarketClose: boolean;
  rfqExpiredTime: string;
  quoteNegotiable: boolean;
  valueNegotiable: boolean;
  minimumValueCrores: string;
  valueStepSize: string;
  accessType: string;
  anonymous: boolean;
}

export interface AdditionalInformationDataProps {
  sector: string;
  rating: string;
  remarks: string;
}

export interface RecordInformationDataProps {
  created: string;
  lastUpdated: string;
}