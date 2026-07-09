import { CreateRfqResponseItem } from "@root/apiGateway";

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
    accessType: number;
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

// Format date utility
const formatDateTime = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        return date.toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'Asia/Kolkata',
            timeZoneName: 'short'
        });
    } catch {
        return dateString;
    }
};



export const mapRfqToComponents = (data: CreateRfqResponseItem) => {
    // Helper function to safely format percentage
    const formatPercentage = (value: number | null | undefined): string => {
        if (value === null || value === undefined) return 'N/A';
        return `${value.toFixed(4)}%`;
    };

    // Helper function to safely format number with default
    const formatNumber = (value: number | null | undefined, defaultValue = '0'): string => {
        if (value === null || value === undefined) return defaultValue;
        return value.toString();
    };

    const rfqInformation: RfqInformationDataProps = {
        isin: data.isin || 'N/A',
        segment: (data.segment),
        buySell: (data.buySell),
        quoteType: (data.quoteType),
        dealType: (data.dealType),
        rfqSizeCrores: formatNumber(data.value),
        settlementDate: data.settlementDate || 'N/A',
        yieldType: (data.yieldType),
        yield: formatPercentage(data.yield),
        rfqNumber: data.number || 'N/A',
        participantCode: data.participantCode || 'N/A',
        clientRegistrationType: (data.clientRegType),
        status: (data.status),
    };

    const tradingOptions: TradingOptionsDataProps = {
        rfqValidTillMarketClose: data.gtdFlag === 'Y',
        rfqExpiredTime: data.endTime || '16:00',
        quoteNegotiable: data.quoteNegotiable === 'Y',
        valueNegotiable: data.valueNegotiable === 'Y',
        minimumValueCrores: formatNumber(data.minFillValue),
        valueStepSize: formatNumber(data.valueStepSize, '0.1'),
        accessType: (data.access),
        anonymous: data.anonymous === 'Y',
    };

    const additionalInformation: AdditionalInformationDataProps = {
        sector: data.category || 'Not Specified',
        rating: data.rating || 'Not Rated',
        remarks: data.remarks || 'No additional remarks provided',
    };

    const recordInformation: RecordInformationDataProps = {
        created: data.createdAt ? formatDateTime(data.createdAt) :
            data.date ? formatDateTime(data.date) : 'N/A',
        lastUpdated: data.updatedAt ? formatDateTime(data.updatedAt) :
            data.date ? formatDateTime(data.date) : 'N/A',
    };

    return {
        rfqInformation,
        tradingOptions,
        additionalInformation,
        recordInformation,
    };
};