import {
    Container,
    FilterBar,
    CancelAllButton,
    PendingTable,
    EmptyArea,
    EmptyIcon, CancelButton, FilterButtonGroup, FilterButton,
} from "./PendingOrder.styles";
import {useMemo, useState} from "react";

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

const pendingOrders = [
    {
        id: 1,
        time: "2026.05.30 14:22:31",
        market: "BTC/KRW",
        type: "매수",
        triggerPrice: "154,000,000",
        orderPrice: "153,500,000",
        quantity: "0.0015",
        remaining: "0.0015",
    },
    {
        id: 2,
        time: "2026.05.30 13:48:11",
        market: "ETH/KRW",
        type: "매도",
        triggerPrice: "4,200,000",
        orderPrice: "4,250,000",
        quantity: "0.25",
        remaining: "0.18",
    },
    {
        id: 3,
        time: "2026.05.30 12:05:44",
        market: "XRP/KRW",
        type: "매수",
        triggerPrice: "3,200",
        orderPrice: "3,100",
        quantity: "120",
        remaining: "120",
    },
];

type OrderFilterType = "전체" | "매수" | "매도";
const filterTypes: OrderFilterType[] = ["전체", "매수", "매도"];

function PendingOrder() {

    const [filterType, setFilterType] = useState<OrderFilterType>("전체");

    const filteredOrders = useMemo(() => {
        if (filterType === "전체") return pendingOrders;
        return pendingOrders.filter((order) => order.type === filterType);

    }, [filterType]);

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

                <CancelAllButton disabled={pendingOrders.length === 0}>
                    일괄취소
                </CancelAllButton>
            </FilterBar>
            {filteredOrders.length === 0 ? (
                <EmptyArea>
                    <EmptyIcon />
                    <span>미체결 주문이 없습니다.</span>
                </EmptyArea>

            ) : (
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
                        <tr key={order.id}>
                            <td>{order.time}</td>
                            <td>{order.market}</td>
                            <td>{order.type}</td>
                            <td>{order.triggerPrice}</td>
                            <td>{order.orderPrice}</td>
                            <td>{order.quantity}</td>
                            <td>{order.remaining}</td>
                            <td>
                                <CancelButton>취소</CancelButton>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </PendingTable>
            )}
        </Container>
    );
}

export default PendingOrder;