import {API} from "../constants/endpoints.ts";

export interface Market {
    market:string;
    korean_name:string;
    english_name:string;
}

export interface Ticker {
    market:string;
    trade_price: number;
    signed_change_rate: number;
    acc_trade_price_24h: number;
}

export async function fetchMarkets(): Promise<Market[]> {
    const response = await fetch(API.MARKETS);

    if (!response.ok) {
        throw new Error("Market 데이터 조회 실패");
    }

    return response.json();
}

export async function fetchTickers(markets:string[]): Promise<Ticker[]> {
    const query = markets.join(",");
    const response = await fetch(`${API.TICKERS}?markets=${query}`);

    if (!response.ok) {
        throw new Error("Failed to fetch tickers");
    }

    return response.json();
}