import {
    ActionCell, CancelButton, Container, DateCell,
    EmptyCell, FilterBar, Header, HeaderCell, MarketCell, Period, PriceCell, QuantityCell,
    RadioGroup, Row,
    type Side, SideText, Table, TableScroll
} from "@pages/market/components/order/OrderHistory/OrderHistory.styles";
import {
    cancelLimitOrder,
    fetchPendingLimitOrders,
    fetchTradeHistories,
    type PendingLimitOrderResponse,
    type TradeHistoryResponse
} from "@api/api";
import {useEffect, useMemo, useState} from "react";

type HistoryView = "pending" | "filled";

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

interface PendingOrderItem {
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
    onOrderCancelled?: () => void;
}

function OrderHistory({marketCode, onOrderCancelled}: OrderHistoryProps) {
    const [view, setView] = useState<HistoryView>("filled");
    const [trades, setTrades] = useState<TradeItem[]>([]);
    const [pendingOrders, setPendingOrders] = useState<PendingOrderItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [cancelingOrderId, setCancelingOrderId] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        let ignore = false;

        const loadOrders = async () => {
            try {
                setIsLoading(true);
                setErrorMessage("");

                if (view === "filled") {
                    const response = await fetchTradeHistories(null, 50);
                    if (!ignore) {
                        setTrades(response.items.map(toTradeItem));
                    }
                } else {
                    const response = await fetchPendingLimitOrders();
                    if (!ignore) {
                        setPendingOrders(response.map(toPendingOrderItem));
                    }
                }
            } catch (error) {
                console.error("주문창 주문 내역 조회 실패", error);
                if (!ignore) {
                    setErrorMessage("주문 내역을 불러오지 못했습니다.");
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        };

        void loadOrders();

        return () => {
            ignore = true;
        };
    }, [view]);

    const filteredTrades = useMemo(
        () => trades.filter((trade) => trade.marketCode === marketCode),
        [marketCode, trades]
    );

    const filteredPendingOrders = useMemo(
        () => pendingOrders.filter((order) => order.marketCode === marketCode),
        [marketCode, pendingOrders]
    );

    const handleCancel = async (orderId: number) => {
        try {
            setCancelingOrderId(orderId);
            setErrorMessage("");

            await cancelLimitOrder(orderId);
            setPendingOrders((orders) => orders.filter((order) => order.id !== orderId));
            onOrderCancelled?.();
        } catch (error) {
            console.error("주문창 미체결 주문 취소 실패", error);
            alert("주문 취소에 실패했습니다.");
        } finally {
            setCancelingOrderId(null);
        }
    };

    const isPendingView = view === "pending";
    const emptyMessage = isPendingView ? "미체결 주문이 없습니다." : "거래내역이 없습니다.";

    return (
        <Container>
            <FilterBar>
                <RadioGroup>
                    <label>
                        <input
                            type="radio"
                            name="status"
                            checked={view === "pending"}
                            onChange={() => setView("pending")}
                        />
                        미체결
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="status"
                            checked={view === "filled"}
                            onChange={() => setView("filled")}
                        />
                        체결
                    </label>
                </RadioGroup>

                <Period>현재 ▾</Period>
            </FilterBar>

            <TableScroll>
                <Table>
                    <Header>
                        <HeaderCell>주문시간</HeaderCell>
                        <HeaderCell>마켓명</HeaderCell>
                        <HeaderCell>{isPendingView ? "주문가격 / 금액" : "체결가격 / 금액"}</HeaderCell>
                        <HeaderCell>{isPendingView ? "미체결수량" : "체결수량"}</HeaderCell>
                        <HeaderCell>{isPendingView ? "취소" : ""}</HeaderCell>
                    </Header>

                    {isLoading && <EmptyRow>주문 내역을 불러오는 중입니다.</EmptyRow>}
                    {!isLoading && errorMessage && <EmptyRow>{errorMessage}</EmptyRow>}
                    {!isLoading && !errorMessage && isPendingView && filteredPendingOrders.length === 0 && (
                        <EmptyRow>{emptyMessage}</EmptyRow>
                    )}
                    {!isLoading && !errorMessage && !isPendingView && filteredTrades.length === 0 && (
                        <EmptyRow>{emptyMessage}</EmptyRow>
                    )}
                    {!isLoading && !errorMessage && isPendingView && filteredPendingOrders.map((order) => (
                        <Row key={order.id}>
                            <DateCell>
                                <div>{order.date}</div>
                                <div>{order.time}</div>
                            </DateCell>

                            <MarketCell>
                                <div>{order.market}</div>
                                <SideText side={order.side}>
                                    {order.side === "buy" ? "매수" : "매도"}
                                </SideText>
                            </MarketCell>

                            <PriceCell>
                                <div>{order.price.toLocaleString()}</div>
                                <div>{order.amount.toLocaleString()}</div>
                            </PriceCell>

                            <QuantityCell>{order.quantity}</QuantityCell>

                            <ActionCell>
                                <CancelButton
                                    type="button"
                                    disabled={cancelingOrderId === order.id}
                                    onClick={() => void handleCancel(order.id)}
                                >
                                    취소
                                </CancelButton>
                            </ActionCell>
                        </Row>
                    ))}
                    {!isLoading && !errorMessage && !isPendingView && filteredTrades.map((trade) => (
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

                            <ActionCell />
                        </Row>
                    ))}
                </Table>
            </TableScroll>
        </Container>
    );
}

function toPendingOrderItem(order: PendingLimitOrderResponse): PendingOrderItem {
    const [baseAssetCode = "", targetAssetCode = order.marketCode] = order.marketCode.split("-");
    const {date, time} = splitDateTime(order.orderedAt);

    return {
        id: order.orderId,
        date,
        time,
        marketCode: order.marketCode,
        market: `${targetAssetCode}/${baseAssetCode}`,
        side: order.tradeSide === "BUY" ? "buy" : "sell",
        price: order.limitPrice,
        amount: order.quantity * order.limitPrice,
        quantity: order.quantity - order.executedQuantity,
    };
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
