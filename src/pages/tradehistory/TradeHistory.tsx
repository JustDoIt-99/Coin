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
import type {HistoryType, PeriodType} from "@pages/tradehistory/types.ts";
import {histories, historyHeaders, periodButtons, typeButtons} from "@pages/tradehistory/constants.ts";
import {
    formatDate,
    getEndOfDay,
    getStartDateByPeriod,
    parseHistoryDate,
    toDateInputValue
} from "@pages/tradehistory/utils.ts";

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