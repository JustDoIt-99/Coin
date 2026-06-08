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
    highest_52_week_price: number;
    highest_52_week_date: string;
    lowest_52_week_price: number;
    lowest_52_week_date: string;
    acc_bid_volume: number;
    acc_ask_volume: number;
}

export interface MinuteCandle {
    market: string;
    candle_date_time_utc: string;
    candle_date_time_kst: string;
    opening_price: number;
    high_price: number;
    low_price: number;
    trade_price: number;
    timestamp: number;
    candle_acc_trade_price: number;
    candle_acc_trade_volume: number;
    unit: number;
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

export async function fetchMinuteCandles(
    market:string,
    unit = 5,
    count = 100,
    to?: string
    ): Promise<MinuteCandle[]> {
    const params = new URLSearchParams({
        market,
        count: String(count),
    });

    if (to) {
        params.append("to", to);
    }

    const response = await fetch(`${API.CANDLES}/${unit}?${params}`);

    if (!response.ok) {
        throw new Error("캔들 데이터 조회 실패");
    }

    return response.json();
}

export async function fetchMinuteCandlesPage(
    market: string,
    unit: number,
    pageCount = 3,
    to?: string
): Promise<MinuteCandle[]> {
    let result: MinuteCandle[] = [];
    let nextTo = to;

    for (let i = 0; i < pageCount; i++) {
        const candles = await fetchMinuteCandles(market,  unit,  200, nextTo);

        if (candles.length == 0) break;

        result.push(...candles);

        const oldestCandle = candles[candles.length - 1];
        nextTo = oldestCandle.candle_date_time_utc;
    }

    return result;
}

export async function subscribeOrderBook(marketCode: string): Promise<void> {
    if (!marketCode) return;

    const response = await fetch(
        `${API.ORDERBOOK_SUBSCRIPTION}?marketCode=${encodeURIComponent(marketCode)}`,
        {
            method: "POST"
        }
    );

    if (!response.ok) {
        throw new Error("호가창 구독 요청에 실패했습니다.");
    }
}

export async function subscribeTrade(marketCode: string): Promise<void> {

    const response = await fetch(

        `${API.TRADE_SUBSCRIPTION}?marketCode=${encodeURIComponent(marketCode)}`,
        {
            method: "POST",
        }

    );

    if (!response.ok) {
        throw new Error("체결 데이터 구독 요청에 실패했습니다.");
    }
}