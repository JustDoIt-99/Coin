import type {HistoryType, PeriodType} from "@pages/tradehistory/types";
export const periodButtons: PeriodType[] = ["1주일", "1개월", "3개월", "6개월", "직접입력"];
export const typeButtons: HistoryType[] = ["전체", "매수", "매도", "입금", "출금"];
export const historyHeaders = [
    "체결시간", "코인", "마켓", "종류", "거래수량",
    "거래단가", "거래금액", "수수료", "정산금액", "주문시간",
];
