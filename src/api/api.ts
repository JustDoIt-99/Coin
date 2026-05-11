import {API} from "../constants/endpoints.ts";

export interface Market {
    market:string;
    korean_name:string;
    english_name:string;
}

export interface Ticker {
    market: string;
    trade_price: number;
    signed_change_rate: number;
    signed_change_price: number;
    high_price: number;
    low_price: number;
    acc_trade_volume_24h: number;
    acc_trade_price_24h: number;
    prev_closing_price: number;
}

export interface MinuteCandle {
    market: string;
    candle_date_time_kst: string;
    trade_price: number;
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

export async function fetchMinuteCandles(market:string, unit = 5, count = 100): Promise<MinuteCandle[]> {
    const response = await fetch(`${API.CANDLES}/${unit}?market=${market}&count=${count}`);

    if (!response.ok) {
        throw new Error("캔들 데이터 조회 실패");
    }

    return response.json();
}