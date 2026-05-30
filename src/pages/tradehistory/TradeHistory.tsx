import {
    HistoryContainer,
    FilterSection,
    FilterGroup,
    FilterTitle,
    PeriodButtonGroup,
    FilterButton,
    CoinSearchBox,
    HistoryTable
} from "./TradeHistory.styles";
import { useMemo, useState } from "react";

const histories = [
    {
        id: 1,
        executedAt: "2026.05.29 13:22:11",
        coin: "비트코인",
        market: "BTC/KRW",
        type: "매수",
        quantity: 0.0012,
        price: 154000000,
        totalPrice: 184800,
        fee: 92,
        settlement: 184892,
        orderAt: "2026.05.29 13:21:58",
    },
    {
        id: 2,
        executedAt: "2026.05.26 09:14:01",
        coin: "이더리움",
        market: "ETH/KRW",
        type: "매도",
        quantity: 0.15,
        price: 4200000,
        totalPrice: 630000,
        fee: 315,
        settlement: 629685,
        orderAt: "2026.05.26 09:13:44",
    },
    {
        id: 3,
        executedAt: "2026.05.10 11:05:32",
        coin: "리플",
        market: "XRP/KRW",
        type: "매수",
        quantity: 120,
        price: 3100,
        totalPrice: 372000,
        fee: 186,
        settlement: 372186,
        orderAt: "2026.05.10 11:04:58",
    },
    {
        id: 4,
        executedAt: "2026.04.15 16:40:10",
        coin: "솔라나",
        market: "SOL/KRW",
        type: "매도",
        quantity: 2.5,
        price: 210000,
        totalPrice: 525000,
        fee: 262,
        settlement: 524738,
        orderAt: "2026.04.15 16:39:44",
    },
    {
        id: 5,
        executedAt: "2026.03.01 10:12:45",
        coin: "도지코인",
        market: "DOGE/KRW",
        type: "입금",
        quantity: 500,
        price: 0,
        totalPrice: 0,
        fee: 0,
        settlement: 0,
        orderAt: "2026.03.01 10:12:45",
    },
    {
        id: 6,
        executedAt: "2026.01.20 08:30:00",
        coin: "에이다",
        market: "ADA/KRW",
        type: "출금",
        quantity: 300,
        price: 0,
        totalPrice: 0,
        fee: 0,
        settlement: 0,
        orderAt: "2026.01.20 08:30:00",
    },
    {
        id: 7,
        executedAt: "2025.12.10 14:55:20",
        coin: "폴카닷",
        market: "DOT/KRW",
        type: "매수",
        quantity: 40,
        price: 9800,
        totalPrice: 392000,
        fee: 196,
        settlement: 392196,
        orderAt: "2025.12.10 14:54:48",
    },
    {
        id: 8,
        executedAt: "2025.11.03 19:11:02",
        coin: "체인링크",
        market: "LINK/KRW",
        type: "매도",
        quantity: 25,
        price: 32000,
        totalPrice: 800000,
        fee: 400,
        settlement: 799600,
        orderAt: "2025.11.03 19:10:35",
    },
];



type PeriodType = "1주일" | "1개월" | "3개월" | "6개월" | "직접입력";
type HistoryType = "전체" | "매수" | "매도" | "입금" | "출금";

const periodButtons: PeriodType[] = ["1주일", "1개월", "3개월", "6개월", "직접입력"];
const typeButtons: HistoryType[] = ["전체", "매수", "매도", "입금", "출금"];

const historyHeaders = [
    "체결시간", "코인", "마켓", "종류", "거래수량",
    "거래단가", "거래금액", "수수료", "정산금액", "주문시간",
];

// histories는 기존 그대로

const parseHistoryDate = (dateText: string) => {
    return new Date(dateText.replace(/\./g, "-"));
};

const getStartDateByPeriod = (period: PeriodType, endDate: Date) => {
    const startDate = new Date(endDate);

    switch (period) {
        case "1주일":
            startDate.setDate(startDate.getDate() - 7);
            return startDate;
        case "1개월":
            startDate.setMonth(startDate.getMonth() - 1);
            return startDate;
        case "3개월":
            startDate.setMonth(startDate.getMonth() - 3);
            return startDate;
        case "6개월":
            startDate.setMonth(startDate.getMonth() - 6);
            return startDate;
        case "직접입력":
            return null;
    }
};

const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}.${month}.${day}`;
};

const toDateInputValue = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const getEndOfDay = (dateValue: string) => {
    return new Date(`${dateValue}T23:59:59`);
};

function TradeHistory() {
    const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("1개월");
    const [selectedType, setSelectedType] = useState<HistoryType>("전체");
    const [searchKeyword, setSearchKeyword] = useState("");

    const today = new Date();

    const defaultStartDate = getStartDateByPeriod("1개월", today);

    const [customStartDate, setCustomStartDate] = useState(
        defaultStartDate ? toDateInputValue(defaultStartDate) : ""
    );
    const [customEndDate, setCustomEndDate] = useState(toDateInputValue(today));

    const endDate =
        selectedPeriod === "직접입력"
            ? getEndOfDay(customEndDate)
            : today;

    const startDate =
        selectedPeriod === "직접입력"
            ? new Date(`${customStartDate}T00:00:00`)
            : getStartDateByPeriod(selectedPeriod, endDate);

    const periodText =
        selectedPeriod === "직접입력"
            ? `${customStartDate.replaceAll("-", ".")} ~ ${customEndDate.replaceAll("-", ".")}`
            : startDate
                ? `${formatDate(startDate)} ~ ${formatDate(endDate)}`
                : "직접입력";

    const filteredHistories = useMemo(() => {
        const keyword = searchKeyword.trim().toLowerCase();

        return histories.filter((history) => {
            const historyDate = parseHistoryDate(history.executedAt);

            const periodMatch =
                !startDate ||
                (historyDate >= startDate && historyDate <= endDate);

            const typeMatch =
                selectedType === "전체" || history.type === selectedType;

            const coinMatch =
                keyword === "" ||
                history.coin.toLowerCase().includes(keyword) ||
                history.market.toLowerCase().includes(keyword);

            return periodMatch && typeMatch && coinMatch;
        });
    }, [selectedPeriod, selectedType, searchKeyword, startDate, endDate]);

    return (
        <HistoryContainer>
            <FilterSection>
                <FilterGroup>
                    <FilterTitle>
                        기간 <span>{periodText}</span>
                    </FilterTitle>

                    <PeriodButtonGroup>
                        {periodButtons.map((button) => (
                            <FilterButton
                                key={button}
                                $active={selectedPeriod === button}
                                onClick={() => setSelectedPeriod(button)}
                            >
                                {button}
                            </FilterButton>
                        ))}
                    </PeriodButtonGroup>

                    {selectedPeriod === "직접입력" && (
                        <div>
                            <input
                                type="date"
                                value={customStartDate}
                                onChange={(e) => setCustomStartDate(e.target.value)}
                            />
                            <span> ~ </span>
                            <input
                                type="date"
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                            />
                        </div>
                    )}
                </FilterGroup>

                <FilterGroup>
                    <FilterTitle>종류</FilterTitle>

                    <PeriodButtonGroup>
                        {typeButtons.map((button) => (
                            <FilterButton
                                key={button}
                                $active={selectedType === button}
                                onClick={() => setSelectedType(button)}
                            >
                                {button}
                            </FilterButton>
                        ))}
                    </PeriodButtonGroup>
                </FilterGroup>

                <FilterGroup>
                    <FilterTitle>코인선택</FilterTitle>

                    <CoinSearchBox>
                        <input
                            value={searchKeyword}
                            placeholder="전체"
                            aria-label="코인 검색"
                            onChange={(e) => setSearchKeyword(e.target.value)}
                        />
                        <button aria-label="검색">⌕</button>
                    </CoinSearchBox>
                </FilterGroup>
            </FilterSection>

            <HistoryTable>
                <thead>
                <tr>
                    {historyHeaders.map((header) => (
                        <th key={header}>{header}</th>
                    ))}
                </tr>
                </thead>

                <tbody>
                {filteredHistories.map((history) => (
                    <tr key={history.id}>
                        <td>{history.executedAt}</td>
                        <td>{history.coin}</td>
                        <td>{history.market}</td>
                        <td>{history.type}</td>
                        <td>{history.quantity}</td>
                        <td>{history.price.toLocaleString()}</td>
                        <td>{history.totalPrice.toLocaleString()}</td>
                        <td>{history.fee.toLocaleString()}</td>
                        <td>{history.settlement.toLocaleString()}</td>
                        <td>{history.orderAt}</td>
                    </tr>
                ))}
                </tbody>
            </HistoryTable>
        </HistoryContainer>
    );
}

export default TradeHistory;