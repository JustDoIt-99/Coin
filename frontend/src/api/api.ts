import {API} from "@constants/endpoints";
import {authFetch} from "@auth/authFetch";

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
    timestamp?: number;
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

export type CandleType = "minute" | "day" | "week" | "month";

export interface CandleInterval {
    type: CandleType;
    unit?: number;
}

export interface MarketBuyRequest {
    marketCode: string;
    amount: number;
}

export interface LimitBuyRequest {
    marketCode: string;
    quantity: number;
    limitPrice: number;
}

export interface LimitSellRequest {
    marketCode: string;
    quantity: number;
    limitPrice: number;
}

export interface AssetResponse {
    assetCode: string;
    balance: number;
    averageBuyPrice: number;
}

export interface MarketBuyResponse {
    orderId: number;
    marketCode: string;
    orderAmount: number;
    executedAmount: number;
    executedPrice: number;
    executedQuantity: number;
    remainingCashBalance: number;
    coinBalance: number;
    averageBuyPrice: number;
}

export interface MarketSellRequest {
    marketCode: string;
    quantity: number;
}

export interface MarketSellResponse {
    orderId: number;
    marketCode: string;
    orderQuantity: number;
    executedAmount: number;
    executedPrice: number;
    executedQuantity: number;
    cashBalance: number;
    coinBalance: number;
    averageBuyPrice: number;
}

export type OrderStatus = "PENDING" | "EXECUTING" | "EXECUTION_RETRY_PENDING" | "FILLED" | "CANCELLED";

export interface LimitBuyResponse {
    orderId: number;
    marketCode: string;
    quantity: number;
    limitPrice: number;
    lockedAmount: number;
    status: OrderStatus;
}

export interface LimitSellResponse {
    orderId: number;
    marketCode: string;
    quantity: number;
    limitPrice: number;
    lockedAmount: number;
    status: OrderStatus;
}

export type TradeSide = "BUY" | "SELL";
export type ApiOrderType = "MARKET" | "LIMIT";

export interface PendingLimitOrderResponse {
    orderId: number;
    marketCode: string;
    tradeSide: TradeSide;
    orderType: ApiOrderType;
    status: OrderStatus;
    quantity: number;
    limitPrice: number;
    lockedAmount: number;
    executedQuantity: number;
    orderedAt: string;
}

export interface CancelLimitOrderResponse {
    orderId: number;
    marketCode: string;
    releasedAmount: number;
    status: OrderStatus;
}

export interface TradeHistoryResponse {
    id: number;
    marketCode: string;
    tradeSide: TradeSide;
    orderType: ApiOrderType;
    quantity: number;
    price: number;
    totalAmount: number;
    orderedAt: string;
    executedAt: string;
}

export interface TradeHistoryCursorResponse {
    items: TradeHistoryResponse[];
    nextCursorId: number | null;
    hasNext: boolean;
}

export interface PortfolioAssetResponse {
    assetCode: string;
    balance: number;
    averageBuyPrice: number | null;
    currentPrice: number;
    buyAmount: number;
    valuationAmount: number;
    profitAmount: number;
    profitRate: number;
    weight: number;
}

export interface PortfolioAssetSummaryResponse {
    cashBalance: number;
    totalAssetAmount: number;
    totalBuyAmount: number;
    totalValuationAmount: number;
    totalProfitAmount: number;
    totalProfitRate: number;
    availableOrderAmount: number;
    assets: PortfolioAssetResponse[];
}

export type AssetTransferType = "DEPOSIT" | "WITHDRAW";
export type AssetTransferStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "REJECTED";

export interface PendingAssetTransferResponse {
    id: number;
    assetCode: string;
    type: AssetTransferType;
    amount: number;
    transactionId: string;
    status: AssetTransferStatus;
    requestedAt: string;
}

export interface AdminAssetTransferResponse extends PendingAssetTransferResponse {
    userId: number;
    userEmail: string;
    userNickname: string;
}

export interface CashDepositRequest {
    amount: number;
}

export async function fetchMarkets(): Promise<Market[]> {
    const response = await fetch(API.MARKETS);

    if (!response.ok) {
        throw new Error("Market 데이터 조회 실패");
    }

    return response.json();
}

export async function fetchAssets(): Promise<AssetResponse[]> {
    const response = await authFetch(API.ASSETS);

    if (!response.ok) {
        throw new Error("자산 조회에 실패했습니다.");
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
    return fetchCandles(market, {type: "minute", unit}, count, to);
}

export async function fetchCandles(
    market:string,
    interval: CandleInterval,
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

    const path = getCandlePath(interval);
    const response = await fetch(`${API.CANDLES}/${path}?${params}`);

    if (!response.ok) {
        throw new Error("캔들 데이터 조회 실패");
    }

    return response.json();
}

function getCandlePath(interval: CandleInterval) {
    switch (interval.type) {
        case "minute":
            return `minutes/${interval.unit ?? 15}`;
        case "day":
            return "days";
        case "week":
            return "weeks";
        case "month":
            return "months";
    }
}

export async function fetchMinuteCandlesPage(
    market: string,
    unit: number,
    pageCount = 3,
    to?: string
): Promise<MinuteCandle[]> {
    return fetchCandlesPage(market, {type: "minute", unit}, pageCount, to);
}

export async function fetchCandlesPage(
    market: string,
    interval: CandleInterval,
    pageCount = 3,
    to?: string
): Promise<MinuteCandle[]> {
    const result: MinuteCandle[] = [];
    let nextTo = to;

    for (let i = 0; i < pageCount; i++) {
        const candles = await fetchCandles(market, interval, 200, nextTo);

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

export async function marketBuy(request: MarketBuyRequest): Promise<MarketBuyResponse> {
    const response = await authFetch(API.MARKET_BUY, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        throw new Error("시장가 매수에 실패했습니다.");
    }

    return response.json();
}

export async function marketSell(request: MarketSellRequest): Promise<MarketSellResponse> {
    const response = await authFetch(API.MARKET_SELL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        throw new Error("시장가 매도에 실패했습니다.");
    }

    return response.json();
}

export async function limitBuy(request: LimitBuyRequest): Promise<LimitBuyResponse> {
    const response = await authFetch(API.LIMIT_BUY, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        throw new Error("지정가 매수 주문에 실패했습니다.");
    }

    return response.json();
}

export async function limitSell(request: LimitSellRequest): Promise<LimitSellResponse> {
    const response = await authFetch(API.LIMIT_SELL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        throw new Error("지정가 매도 주문에 실패했습니다.");
    }

    return response.json();
}

export async function fetchPendingLimitOrders(): Promise<PendingLimitOrderResponse[]> {
    const response = await authFetch(API.PENDING_LIMIT_ORDERS);

    if (!response.ok) {
        throw new Error("미체결 주문 조회에 실패했습니다.");
    }

    return response.json();
}

export async function cancelLimitOrder(orderId: number): Promise<CancelLimitOrderResponse> {
    const response = await authFetch(`${API.LIMIT_ORDER}/${orderId}`, {
        method: "DELETE",
    });

    if (!response.ok) {
        throw new Error("지정가 주문 취소에 실패했습니다.");
    }

    return response.json();
}

export async function fetchTradeHistories(cursorId?: number | null, size = 20): Promise<TradeHistoryCursorResponse> {
    const params = new URLSearchParams({
        size: String(size),
    });

    if (cursorId) {
        params.append("cursorId", String(cursorId));
    }

    const response = await authFetch(`${API.TRADE_HISTORIES}?${params}`);

    if (!response.ok) {
        throw new Error("거래내역 조회에 실패했습니다.");
    }

    return response.json();
}


export async function getPortfolioAssetSummary(): Promise<PortfolioAssetSummaryResponse> {
    const response = await authFetch(API.PORTFOLIO_SUMMARY);

    if (!response.ok) {
        throw new Error("포트폴리오 요약 조회 실패");
    }

    return response.json();
}

export async function fetchPendingAssetTransfers(): Promise<PendingAssetTransferResponse[]> {
    const response = await authFetch(API.PENDING_ASSET_TRANSFERS);

    if (!response.ok) {
        throw new Error("입출금 대기 내역 조회에 실패했습니다.");
    }

    return response.json();
}

export async function requestCashDeposit(request: CashDepositRequest): Promise<PendingAssetTransferResponse> {
    const response = await authFetch(API.CASH_DEPOSITS, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        throw new Error("현금 충전 요청에 실패했습니다.");
    }

    return response.json();
}

export async function fetchAdminPendingAssetTransfers(): Promise<AdminAssetTransferResponse[]> {
    const response = await authFetch(API.ADMIN_PENDING_ASSET_TRANSFERS);

    if (!response.ok) {
        throw new Error("관리자 입출금 대기 내역 조회에 실패했습니다.");
    }

    return response.json();
}

export async function approveAssetTransfer(transferId: number): Promise<AdminAssetTransferResponse> {
    const response = await authFetch(`${API.ADMIN_ASSET_TRANSFERS}/${transferId}/approve`, {
        method: "POST",
    });

    if (!response.ok) {
        throw new Error("현금 충전 요청 승인에 실패했습니다.");
    }

    return response.json();
}

export async function rejectAssetTransfer(transferId: number): Promise<AdminAssetTransferResponse> {
    const response = await authFetch(`${API.ADMIN_ASSET_TRANSFERS}/${transferId}/reject`, {
        method: "POST",
    });

    if (!response.ok) {
        throw new Error("현금 충전 요청 거절에 실패했습니다.");
    }

    return response.json();
}
