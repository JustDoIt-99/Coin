import {
    Container,
    FilterBar,
    CancelAllButton,
    PendingTable,
    EmptyArea,
    EmptyIcon, CancelButton, FilterButtonGroup, FilterButton,
} from "./PendingOrder.styles";
import {useEffect, useMemo, useState} from "react";
import {
    cancelLimitOrder,
    fetchPendingLimitOrders,
    type PendingLimitOrderResponse,
} from "@api/api";

const headers = [
    { key: "time", label: "시간" },
    { key: "market", label: "마켓명" },
    { key: "type", label: "거래종류" },
    { key: "triggerPrice", label: "감시가격" },
    { key: "orderPrice", label: "주문가격" },
    { key: "quantity", label: "주문수량" },
    { key: "remaining", label: "미체결량" },
    { key: "action", label: "" },
];

type OrderFilterType = "전체" | "매수" | "매도";
const filterTypes: OrderFilterType[] = ["전체", "매수", "매도"];

function PendingOrder() {

    const [filterType, setFilterType] = useState<OrderFilterType>("전체");
    const [orders, setOrders] = useState<PendingLimitOrderResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [cancellingOrderId, setCancellingOrderId] = useState<number | null>(null);

    const loadPendingOrders = async () => {
        try {
            setIsLoading(true);
            setMessage("");
            const response = await fetchPendingLimitOrders();
            setOrders(response);
        } catch (error) {
            console.error("미체결 주문 조회 실패", error);
            setMessage("미체결 주문을 불러오지 못했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void loadPendingOrders();
    }, []);

    const filteredOrders = useMemo(() => {
        if (filterType === "전체") return orders;
        return orders.filter((order) => getOrderTypeLabel(order) === filterType);

    }, [filterType, orders]);

    const handleCancel = async (order: PendingLimitOrderResponse) => {
        const orderTypeLabel = getOrderTypeLabel(order);
        const confirmed = window.confirm(`${formatMarket(order.marketCode)} 지정가 ${orderTypeLabel} 주문을 취소할까요?`);
        if (!confirmed) return;

        try {
            setCancellingOrderId(order.orderId);
            setMessage("");
            await cancelLimitOrder(order.orderId);
            setOrders((currentOrders) => currentOrders.filter((item) => item.orderId !== order.orderId));
            setMessage(`지정가 ${orderTypeLabel} 주문을 취소했습니다.`);
        } catch (error) {
            console.error("지정가 주문 취소 실패", error);
            setMessage(`지정가 ${orderTypeLabel} 주문 취소에 실패했습니다.`);
        } finally {
            setCancellingOrderId(null);
        }
    };

    return (
        <Container>
            <FilterBar>
                <FilterButtonGroup>
                    {filterTypes.map((type) => (
                        <FilterButton
                            key={type}
                            $active={filterType === type}
                            onClick={() => setFilterType(type)}
                        >
                            {type}
                        </FilterButton>
                    ))}
                </FilterButtonGroup>

                <CancelAllButton disabled={filteredOrders.length === 0}>
                    일괄취소
                </CancelAllButton>
            </FilterBar>
            {isLoading ? (
                <EmptyArea>
                    <EmptyIcon />
                    <span>미체결 주문을 불러오는 중입니다.</span>
                </EmptyArea>
            ) : filteredOrders.length === 0 ? (
                <EmptyArea>
                    <EmptyIcon />
                    <span>{message || "미체결 주문이 없습니다."}</span>
                </EmptyArea>

            ) : (
                <>
                    {message && (
                        <EmptyArea style={{height: 56, fontSize: 13}}>
                            <span>{message}</span>
                        </EmptyArea>
                    )}
                    <PendingTable>
                        <thead>
                        <tr>
                            {headers.map((header) => (
                                <th key={`${header.key}`}>{header.label}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {filteredOrders.map((order) => (
                            <tr key={order.orderId}>
                                <td>{formatTime(order.orderedAt)}</td>
                                <td>{formatMarket(order.marketCode)}</td>
                                <td>{getOrderTypeLabel(order)}</td>
                                <td>-</td>
                                <td>{formatKrw(order.limitPrice)}</td>
                                <td>{formatQuantity(order.quantity)}</td>
                                <td>{formatQuantity(order.quantity - order.executedQuantity)}</td>
                                <td>
                                    <CancelButton
                                        disabled={cancellingOrderId === order.orderId}
                                        onClick={() => handleCancel(order)}
                                    >
                                        {cancellingOrderId === order.orderId ? "취소중" : "취소"}
                                    </CancelButton>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </PendingTable>
                </>
            )}
        </Container>
    );
}

function getOrderTypeLabel(order: PendingLimitOrderResponse) {
    return order.tradeSide === "BUY" ? "매수" : "매도";
}

function formatMarket(marketCode: string) {
    const [baseAssetCode, targetAssetCode] = marketCode.split("-");
    return `${targetAssetCode}/${baseAssetCode}`;
}

function formatTime(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });
}

function formatKrw(value: number) {
    return Math.floor(value).toLocaleString();
}

function formatQuantity(value: number) {
    return value.toLocaleString(undefined, {
        maximumFractionDigits: 8,
    });
}

export default PendingOrder;
