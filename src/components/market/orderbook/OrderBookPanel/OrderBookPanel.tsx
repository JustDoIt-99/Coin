import {OrderBookList, Panel} from "@components/market/orderbook/OrderBookPanel/OrderBookPanel.styles.ts";
import OrderBookRow from "@components/market/orderbook/OrderBookRow/OrderBookRow.tsx";

interface Props {
    type: "ask" | "bid";
    rows: OrderBookRowData[];
}

export interface OrderBookRowData {
    price: number;
    size: number;
    rate: number;
}

function OrderBookPanel({type, rows}: Props) {
    const maxSize = rows.length === 0 ? 0 :
        Math.max(...rows.map((row) => row.size));

    return (
        <Panel>
            <OrderBookList>
                {rows.map((row) => {
                    const ratio = maxSize === 0
                        ? 0
                        : (row.size / maxSize) * 100;
                    return (
                        <OrderBookRow
                            key={`${type}-${row.price}`}
                            type={type}
                            price={row.price}
                            size={row.size}
                            rate={row.rate}
                            ratio={ratio}
                        />
                    );
                })}
            </OrderBookList>
        </Panel>
    );
}

export default OrderBookPanel;