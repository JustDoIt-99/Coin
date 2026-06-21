import {
    Container, DateCell,
    EmptyCell, FilterBar, Header, HeaderCell, MarketCell, Period, PriceCell, QuantityCell,
    RadioGroup, Row,
    type Side, SideText, Table, TableScroll
} from "@pages/market/components/order/OrderHistory/OrderHistory.styles";
import {fetchTradeHistories, type TradeHistoryResponse} from "@api/api";
import {useEffect, useMemo, useState} from "react";

interface TradeItem {
    id: number;
    date: string;
    time: string;
    marketCode: string;
    market: string;
    side: Side;
    price: number;
    amount: number;
    quantity: number;
}

interface OrderHistoryProps {
    marketCode: string;
}

function OrderHistory({marketCode}: OrderHistoryProps) {
    const [trades, setTrades] = useState<TradeItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        let ignore = false;

        const loadTradeHistories = async () => {
            try {
                setIsLoading(true);
                setErrorMessage("");

                const response = await fetchTradeHistories();
                if (!ignore) {
                    setTrades(response.map(toTradeItem));
                }
            } catch (error) {
                console.error("주문창 거래내역 조회 실패", error);
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

    const filteredTrades = useMemo(
        () => trades.filter((trade) => trade.marketCode === marketCode),
        [marketCode, trades]
    );

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

                    {isLoading && <EmptyRow>거래내역을 불러오는 중입니다.</EmptyRow>}
                    {!isLoading && errorMessage && <EmptyRow>{errorMessage}</EmptyRow>}
                    {!isLoading && !errorMessage && filteredTrades.length === 0 && (
                        <EmptyRow>거래내역이 없습니다.</EmptyRow>
                    )}
                    {!isLoading && !errorMessage && filteredTrades.map((trade) => (
                        <Row key={trade.id}>
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

function EmptyRow({children}: { children: string }) {
    return (
        <Row>
            <EmptyCell>{children}</EmptyCell>
        </Row>
    );
}

function toTradeItem(history: TradeHistoryResponse): TradeItem {
    const [baseAssetCode = "", targetAssetCode = history.marketCode] = history.marketCode.split("-");
    const {date, time} = splitDateTime(history.executedAt);

    return {
        id: history.id,
        date,
        time,
        marketCode: history.marketCode,
        market: `${targetAssetCode}/${baseAssetCode}`,
        side: history.tradeSide === "BUY" ? "buy" : "sell",
        price: history.price,
        amount: history.totalAmount,
        quantity: history.quantity,
    };
}

function splitDateTime(value: string) {
    const date = new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");

    return {
        date: `${year}.${month}.${day}`,
        time: `${hour}:${minute}`,
    };
}

export default OrderHistory;
