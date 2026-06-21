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
import {useEffect, useMemo, useState} from "react";
import type {HistoryType, PeriodType, TradeHistoryItem} from "@pages/tradehistory/types";
import {historyHeaders, periodButtons, typeButtons} from "@pages/tradehistory/constants";
import {
    formatDate,
    getEndOfDay,
    getStartDateByPeriod,
    parseHistoryDate,
    toDateInputValue
} from "@pages/tradehistory/utils";
import {fetchTradeHistories, type TradeHistoryResponse} from "@api/api";

function TradeHistory() {
    const [histories, setHistories] = useState<TradeHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
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
            ? customStartDate
                ? new Date(`${customStartDate}T00:00:00`)
                : null
            : getStartDateByPeriod(selectedPeriod, endDate ?? today);

    const periodText =
        selectedPeriod === "직접입력"
            ? `${customStartDate ? customStartDate.replaceAll("-", ".") : "시작일"} ~ ${
                customEndDate ? customEndDate.replaceAll("-", ".") : "종료일"
            }`
            : startDate && endDate
                ? `${formatDate(startDate)} ~ ${formatDate(endDate)}`
                : "직접입력";

    const startDateTime = startDate?.getTime();
    const endDateTime = endDate?.getTime();

    useEffect(() => {
        let ignore = false;

        const loadTradeHistories = async () => {
            try {
                setIsLoading(true);
                setErrorMessage("");

                const response = await fetchTradeHistories();
                if (!ignore) {
                    setHistories(response.map(toTradeHistoryItem));
                }
            } catch (error) {
                console.error("거래내역 조회 실패", error);
                if (!ignore) {
                    setErrorMessage("거래내역을 불러오지 못했습니다.");
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        };

        void loadTradeHistories();

        return () => {
            ignore = true;
        };
    }, []);

    const filteredHistories = useMemo(() => {
        const keyword = searchKeyword.trim().toLowerCase();

        return histories.filter((history) => {
            const historyTime = parseHistoryDate(history.executedAt).getTime();

            const periodMatch =
                !startDateTime ||
                !endDateTime ||
                (historyTime >= startDateTime && historyTime <= endDateTime);

            const typeMatch =
                selectedType === "전체" || history.type === selectedType;

            const coinMatch =
                keyword === "" ||
                history.coin.toLowerCase().includes(keyword) ||
                history.market.toLowerCase().includes(keyword);

            return periodMatch && typeMatch && coinMatch;
        });
    }, [selectedType, searchKeyword, startDateTime, endDateTime]);

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
                                max={customEndDate}
                                onChange={(e) => setCustomStartDate(e.target.value)}
                            />
                            <span> ~ </span>
                            <input
                                type="date"
                                value={customEndDate}
                                min={customStartDate}
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
                {isLoading && (
                    <tr>
                        <td colSpan={historyHeaders.length}>거래내역을 불러오는 중입니다.</td>
                    </tr>
                )}
                {!isLoading && errorMessage && (
                    <tr>
                        <td colSpan={historyHeaders.length}>{errorMessage}</td>
                    </tr>
                )}
                {!isLoading && !errorMessage && filteredHistories.length === 0 && (
                    <tr>
                        <td colSpan={historyHeaders.length}>거래내역이 없습니다.</td>
                    </tr>
                )}
                {!isLoading && !errorMessage && filteredHistories.map((history) => (
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

function toTradeHistoryItem(history: TradeHistoryResponse): TradeHistoryItem {
    const [baseAssetCode = "", targetAssetCode = history.marketCode] = history.marketCode.split("-");
    const executedAt = formatHistoryDate(history.executedAt);

    return {
        id: history.id,
        executedAt,
        coin: targetAssetCode,
        market: `${targetAssetCode}/${baseAssetCode}`,
        type: history.tradeSide === "BUY" ? "매수" : "매도",
        quantity: history.quantity,
        price: history.price,
        totalPrice: history.totalAmount,
        fee: 0,
        settlement: history.totalAmount,
        orderAt: formatHistoryDate(history.orderedAt) || executedAt,
    };
}

function formatHistoryDate(value: string) {
    if (!value) return "";

    const date = new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");
    const second = String(date.getSeconds()).padStart(2, "0");

    return `${year}.${month}.${day} ${hour}:${minute}:${second}`;
}

export default TradeHistory;
