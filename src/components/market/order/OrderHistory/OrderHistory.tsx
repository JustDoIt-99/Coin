import {
    Container, DateCell,
    FilterBar, Header, HeaderCell, MarketCell, Period, PriceCell, QuantityCell,
    RadioGroup, Row,
    type Side, SideText, Table, TableScroll
} from "@components/market/order/OrderHistory/OrderHistory.styles.ts";

interface TradeItem {
    id: number;
    date: string;
    time: string;
    market: string;
    side: Side;
    price: number;
    amount: number;
    quantity: number;
}

const trades: TradeItem[] = [
    {
        id: 1,
        date: "2026.01.27",
        time: "15:46",
        market: "BTC/KRW",
        side: "sell",
        price: 129130000,
        amount: 9999,
        quantity: 0.00007744,
    },
    {
        id: 2,
        date: "2025.10.22",
        time: "19:13",
        market: "BTC/KRW",
        side: "buy",
        price: 163080000,
        amount: 99955,
        quantity: 0.00061292,
    },
    {
        id: 1,
        date: "2026.01.27",
        time: "15:46",
        market: "BTC/KRW",
        side: "sell",
        price: 129130000,
        amount: 9999,
        quantity: 0.00007744,
    },
    {
        id: 2,
        date: "2025.10.22",
        time: "19:13",
        market: "BTC/KRW",
        side: "buy",
        price: 163080000,
        amount: 99955,
        quantity: 0.00061292,
    },
    {
        id: 2,
        date: "2025.10.22",
        time: "19:13",
        market: "BTC/KRW",
        side: "buy",
        price: 163080000,
        amount: 99955,
        quantity: 0.00061292,
    },
    {
        id: 2,
        date: "2025.10.22",
        time: "19:13",
        market: "BTC/KRW",
        side: "buy",
        price: 163080000,
        amount: 99955,
        quantity: 0.00061292,
    },
    {
        id: 2,
        date: "2025.10.22",
        time: "19:13",
        market: "BTC/KRW",
        side: "buy",
        price: 163080000,
        amount: 99955,
        quantity: 0.00061292,
    }
];

function OrderHistory() {
    return (
        <Container>
            <FilterBar>
                <RadioGroup>
                    <label>
                        <input type="radio" name="status" /> 미체결
                    </label>
                    <label>
                        <input type="radio" name="status" defaultChecked /> 체결
                    </label>
                </RadioGroup>

                <Period>현재 ▾</Period>
            </FilterBar>

            <TableScroll>
                <Table>
                    <Header>
                        <HeaderCell>주문시간</HeaderCell>
                        <HeaderCell>마켓명</HeaderCell>
                        <HeaderCell>체결가격 / 금액</HeaderCell>
                        <HeaderCell>체결수량</HeaderCell>
                    </Header>

                    {trades.map((trade, index) => (
                        <Row key={`${trade.id}-${index}`}>
                            <DateCell>
                                <div>{trade.date}</div>
                                <div>{trade.time}</div>
                            </DateCell>

                            <MarketCell>
                                <div>{trade.market}</div>
                                <SideText side={trade.side}>
                                    {trade.side === "buy" ? "매수" : "매도"}
                                </SideText>
                            </MarketCell>

                            <PriceCell>
                                <div>{trade.price.toLocaleString()}</div>
                                <div>{trade.amount.toLocaleString()}</div>
                            </PriceCell>

                            <QuantityCell>{trade.quantity}</QuantityCell>
                        </Row>
                    ))}
                </Table>
            </TableScroll>
        </Container>
    );
}

export default OrderHistory;