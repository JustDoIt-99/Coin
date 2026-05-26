import {
    HistoryContainer,
    FilterSection,
    FilterGroup,
    FilterTitle,
    PeriodButtonGroup,
    FilterButton,
    CoinSearchBox, HistoryTable
} from "./TradeHistory.styles";

const periodButtons = ["1주일", "1개월", "3개월", "6개월", "직접입력"];
const typeButtons = ["전체", "매수", "매도", "입금", "출금"];

const historyHeaders = [
    "체결시간",
    "코인",
    "마켓",
    "종류",
    "거래수량",
    "거래단가",
    "거래금액",
    "수수료",
    "정산금액",
    "주문시간",
];

const histories = [
    {
        executedAt: "2026.05.26 13:22:11",
        coin: "비트코인",
        market: "BTC/KRW",
        type: "매수",
        quantity: 0.0012,
        price: 154000000,
        totalPrice: 184800,
        fee: 92,
        settlement: 184892,
        orderAt: "2026.05.26 13:21:58",
    },
    {
        executedAt: "2026.05.25 09:14:01",
        coin: "이더리움",
        market: "ETH/KRW",
        type: "매도",
        quantity: 0.15,
        price: 4200000,
        totalPrice: 630000,
        fee: 315,
        settlement: 629685,
        orderAt: "2026.05.25 09:13:44",
    },
];

function TradeHistory() {
    return (
        <HistoryContainer>
            <FilterSection>
                <FilterGroup>
                    <FilterTitle>
                        기간 <span>2026.04.25 ~ 2026.05.25</span>
                    </FilterTitle>

                    <PeriodButtonGroup>
                        {periodButtons.map((button) => (
                            <FilterButton key={button} $active={button === "1개월"}>
                                {button}
                            </FilterButton>
                        ))}
                    </PeriodButtonGroup>
                </FilterGroup>

                <FilterGroup>
                    <FilterTitle>종류</FilterTitle>

                    <PeriodButtonGroup>
                        {typeButtons.map((button) => (
                            <FilterButton key={button} $active={button === "전체"}>
                                {button}
                            </FilterButton>
                        ))}
                    </PeriodButtonGroup>
                </FilterGroup>

                <FilterGroup>
                    <FilterTitle>코인선택</FilterTitle>

                    <CoinSearchBox>
                        <input
                            placeholder="전체"
                            aria-label="코인 검색"
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
                {histories.map((history,index) => (
                    <tr key={`${history.executedAt}-${index}`}>
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