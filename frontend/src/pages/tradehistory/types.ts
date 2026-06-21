export type PeriodType = "1주일" | "1개월" | "3개월" | "6개월" | "직접입력";
export type HistoryType = "전체" | "매수" | "매도" | "입금" | "출금";

export interface TradeHistoryItem {
    id: number;
    executedAt: string;
    coin: string;
    market: string;
    type: HistoryType;
    quantity: number;
    price: number;
    totalPrice: number;
    fee: number;
    settlement: number;
    orderAt: string;
}
